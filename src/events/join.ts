import { Socket } from 'socket.io';

import coordinator from '../providers/coordinator';

interface JoinData {
  roomId: string;
}

export default {
  name: 'join',
  callback: (socket: Socket, data: JoinData) => {
    const room = coordinator.getRoom(data.roomId);

    if (!room) {
      return { error: 'Room not found' };
    }

    room.join(socket.data.user);
    return room.info;
  },
} as SocketEvent;
