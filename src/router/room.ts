import { Router } from 'express';

import coordinator from '../providers/coordinator';

export const roomRouter = Router();

roomRouter.get('/rooms', async (_req, res) => {
  const rooms = coordinator.getRooms();
  return res.json(rooms.map((room) => room.info));
});
