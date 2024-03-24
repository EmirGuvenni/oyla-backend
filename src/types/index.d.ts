import type { Socket } from 'socket.io';
import type { ZodObject } from 'zod';

import User from '../classes/User';

declare global {
  // Helper types
  type PartiallyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
  type PartiallyRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
  type DeepNonNullable<T> = { [K in keyof T]-?: NonNullable<T[K]> };
  type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];

  type SocketEvent = {
    name: string;
    validator: ZodObject;
    callback: (socket: Socket, data: T) => unknown;
  };

  interface Deck {
    cards: number[];
  }

  interface UserCache {
    id: string;
    name: string;
    accessToken: string;
  }
}

declare module 'socket.io' {
  interface Socket {
    data: {
      user: User;
    };
  }
}

declare module 'ioredis' {
  export interface Redis {
    jsonGet<T>(key: string): Promise<T | null>;
    jsonSet(key: string, value: unknown, ttl?: number): Promise<boolean>;
  }
}

export {};
