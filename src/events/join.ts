import { Socket } from 'socket.io';

import coordinator from '../providers/coordinator';

interface JoinData {
  roomId: string;
}

export default {
  name: 'join',
  callback: (socket: Socket, data: JoinData, cb: (arg: unknown) => void) => {
    const room = coordinator.getRoom(data.roomId);

    if (!room) {
      cb({ error: 'Room not found' });
      return;
    }

    room.join(socket.data.user);
    return room.info;
  },
} as SocketEvent;
