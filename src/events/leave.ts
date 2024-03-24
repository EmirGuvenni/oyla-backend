import type { Socket } from 'socket.io';
import { z } from 'zod';

import WsException from '../classes/WsException';
import { ERROR_CODES, ROOM_ID_LENGTH } from '../constants';
import coordinator from '../providers/coordinator';

const LeaveDataSchema = z.object({
  roomId: z.string().length(ROOM_ID_LENGTH),
});
type LeaveData = z.infer<typeof LeaveDataSchema>;

export default {
  name: 'leave',
  validator: LeaveDataSchema,
  callback: (socket: Socket, data: LeaveData) => {
    const room = coordinator.getRoom(data.roomId);

    if (!room) {
      throw new WsException(ERROR_CODES.roomNotFound);
    }

    room.leave(socket.data.user);
    return room.info;
  },
} satisfies SocketEvent;
