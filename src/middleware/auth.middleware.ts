import JWT, { JwtPayload } from 'jsonwebtoken';
import type { Socket } from 'socket.io';

import User from '../classes/User';
import config from '../config';
import redis from '../providers/redis';

function verifyToken(token: string) {
  return JWT.verify(token, config.JWT_SECRET);
}

async function getAndValidateUser(id: string, accessToken: string): Promise<User> {
  const userData = await redis.jsonGet<UserCache>(`user:${id}`);

  if (!userData) {
    throw new Error('User not found');
  }

  const user = new User(userData.name, userData.accessToken);

  if (user.validate(accessToken)) {
    return user;
  }

  throw new Error('Invalid access token');
}

export async function authMiddleware(socket: Socket, next: (err?: Error) => void) {
  try {
    const token =
      socket.handshake.auth.token?.split(' ')[1] ??
      socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('unauthorized'));
    }

    const payload = verifyToken(token) as JwtPayload;
    const user = await getAndValidateUser(payload.id, payload.accessToken);
    user.bindSocket(socket);

    socket.data.user = user;
    next();
  } catch (err) {
    return next(err as Error);
  }
}
