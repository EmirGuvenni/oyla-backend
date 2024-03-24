import type { Socket } from 'socket.io';
import { z } from 'zod';

import Room from '../classes/Room';
import { MAX_ROOM_NAME_LENGTH, MIN_ROOM_NAME_LENGTH } from '../constants';
import coordinator from '../providers/coordinator';

const CreateRoomDataSchema = z.object({
  name: z.string().min(MIN_ROOM_NAME_LENGTH).max(MAX_ROOM_NAME_LENGTH),
  deck: z.object({
    cards: z.array(z.number().or(z.string().min(1))),
  }),
});

type RoomCreationData = z.infer<typeof CreateRoomDataSchema>;

export default {
  name: 'create-room',
  validator: CreateRoomDataSchema,
  callback: (socket: Socket, data: RoomCreationData) => {
    const room = new Room({
      name: data.name,
      master: socket.data.user,
      socket,
      deck: data.deck,
    });

    coordinator.createRoom(room);
    return room.info;
  },
} satisfies SocketEvent;
