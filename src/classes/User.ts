import * as crypto from 'crypto';
import { Socket } from 'socket.io';

import redis from '../providers/redis';

export default class User {
  public id;
  public socket: Socket | undefined;

  get info() {
    return {
      id: this.id,
      name: this.name,
    };
  }

  static generateAccessToken() {
    return crypto.randomBytes(256).toString('hex');
  }

  constructor(
    public name: string,
    private accessToken: string,
    id?: string,
  ) {
    this.id = id || crypto.randomBytes(16).toString('hex');
  }

  public validate(accessToken: string) {
    return this.accessToken === accessToken;
  }

  public bindSocket(socket: Socket) {
    this.socket = socket;
  }

  public async save() {
    await redis.del(`user:${this.id}`);
    await redis.jsonSet(`user:${this.id}`, { ...this.info, accessToken: this.accessToken });
  }

  public async delete() {
    await redis.del(`user:${this.id}`);
  }

  public async changeName(name: string) {
    this.name = name;
    await this.save();
  }
}
