import { Router } from 'express';
import JWT from 'jsonwebtoken';

import User from '../classes/User';
import config from '../config';
import redis from '../providers/redis';

export const userRouter = Router();

userRouter.post('/guest', async (req, res) => {
  const { name } = req.body;

  const accessToken = User.generateAccessToken();
  const user = new User(name, accessToken);
  const token = JWT.sign({ name, accessToken, id: user.id }, config.JWT_SECRET);

  await redis.jsonSet(`user:${user.id}`, { ...user.info, accessToken });

  return res.json({ token, user: user.info });
});
