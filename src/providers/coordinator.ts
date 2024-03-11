import Room from '../classes/Room';

export class Coordinator {
  private rooms: Record<string, Room> = {};

  public createRoom(room: Room): void {
    this.rooms[room.id] = room;
  }

  public getRoom(id: string): Room | undefined {
    return this.rooms[id];
  }

  public getRooms(): Room[] {
    return Object.values(this.rooms);
  }

  public deleteRoom(id: string): void {
    const room = this.rooms[id];
    room.destroy();
    delete this.rooms[id];
  }
}

export default new Coordinator();
