import type { Socket } from 'socket.io';

import Room from '../classes/Room';
import coordinator from '../providers/coordinator';

interface RoomCreationData {
  name: string;
  deck: Deck;
}

export default {
  name: 'create-room',
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
} as SocketEvent;
