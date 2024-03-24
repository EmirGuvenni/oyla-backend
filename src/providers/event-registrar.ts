import fs from 'fs/promises';
import path from 'path';
import type { Server } from 'socket.io';
import { ZodError } from 'zod';

import WsException from '../classes/WsException';
import config from '../config';
import { ERROR_CODES } from '../constants';

async function extractEventModules(dir: string) {
  const files = await fs.readdir(path.join(config.BASE_DIR, dir));
  const modules: SocketEvent[] = [];

  for (const file of files) {
    const stat = await fs.lstat(path.join(config.BASE_DIR, dir, file));

    if (stat.isDirectory()) {
      extractEventModules(path.join(dir, file));
      continue;
    }

    if (!file.endsWith('.ts') && !file.endsWith('.js')) {
      continue;
    }

    const eventName = file.endsWith('.ts')
      ? file.substring(0, file.indexOf('.ts'))
      : file.substring(0, file.indexOf('.js'));

    try {
      const eventModule: SocketEvent = (await import(path.join(config.BASE_DIR, dir, file)))
        .default;

      modules.push(eventModule);
    } catch (err) {
      console.error(`Error loading event ${eventName}:`, err);
    }
  }

  return modules;
}

export default async function registerEvents(io: Server, dir: string) {
  const modules = await extractEventModules(dir);

  io.on('connection', (socket) => {
    for (const module of modules) {
      socket.on(module.name, async (arg, cb) => {
        try {
          const data = module.validator.parse(arg);
          const res = await module.callback(socket, data);
          cb(res);
        } catch (err) {
          if (err instanceof WsException || err instanceof ZodError) {
            cb(err);
          } else {
            console.error(`Error processing event ${module.name}:`, err);
            cb(new WsException(ERROR_CODES.unknownError));
          }
        }
      });
    }
  });
}
