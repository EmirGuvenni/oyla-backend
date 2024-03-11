import { Redis } from 'ioredis';

import config from '../config';

// NOTE: If this doesn't work, make sure the Redis image is 'redis/redis-stack'
Redis.prototype.jsonGet = async <T>(key: string): Promise<T | null> => {
  const rawJSON = (await redis.call('json.get', key, '.')) as string | null;

  if (!rawJSON) return null;
  else return JSON.parse(rawJSON) as T;
};
Redis.prototype.jsonSet = async <T>(key: string, value: T, ttl?: number): Promise<boolean> => {
  const action = (await redis.call('json.set', key, '.', JSON.stringify(value))) as 'OK';

  if (ttl) await redis.call('expire', key, ttl);

  return action === 'OK';
};

const redis = new Redis({
  host: config.REDIS_HOST,
  port: Number(config.REDIS_PORT),
  username: config.REDIS_USERNAME,
  password: config.REDIS_PASSWORD,
});

export default redis;
