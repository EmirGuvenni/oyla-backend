import { Router } from 'express';

import coordinator from '../providers/coordinator';

export const roomRouter = Router();

roomRouter.get('/rooms', async (_req, res) => {
  const rooms = coordinator.getRooms();
  return res.json(rooms.map((room) => room.info));
});

roomRouter.get('/rooms/:id', async (req, res) => {
  const room = coordinator.getRoom(req.params.id);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  return res.json(room.info);
});
