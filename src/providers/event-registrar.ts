import fs from 'fs/promises';
import path from 'path';
import type { Server } from 'socket.io';

import WsException from '../classes/WsException';
import config from '../config';

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
          const res = await module.callback(socket, arg);
          cb(res);
        } catch (err) {
          cb({ error: (err as WsException).message });
        }
      });
    }
  });
}
