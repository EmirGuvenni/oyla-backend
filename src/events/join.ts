import type { Socket } from 'socket.io';
import { z } from 'zod';

import WsException from '../classes/WsException';
import { ERROR_CODES, ROOM_ID_LENGTH } from '../constants';
import coordinator from '../providers/coordinator';

const JoinDataSchema = z.object({
  roomId: z.string().length(ROOM_ID_LENGTH),
});
type JoinData = z.infer<typeof JoinDataSchema>;

export default {
  name: 'join',
  validator: JoinDataSchema,
  callback: (socket: Socket, data: JoinData) => {
    const room = coordinator.getRoom(data.roomId);

    if (!room) {
      throw new WsException(ERROR_CODES.roomNotFound);
    }

    room.join(socket.data.user);
    return room.info;
  },
} satisfies SocketEvent;
