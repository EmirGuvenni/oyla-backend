import { BroadcastOperator, Socket } from 'socket.io';
import {
  DecorateAcknowledgementsWithMultipleResponses,
  DefaultEventsMap,
} from 'socket.io/dist/typed-events';

import { ERROR_CODES, ROOM_ID_LENGTH } from '../constants';
import { createRandomString } from '../utils';
import User from './User';
import WsException from './WsException';

interface RoomOptions {
  master: User;
  socket: Socket;
  deck: Deck;
  name: string;
}

export default class Room {
  public id = createRandomString(ROOM_ID_LENGTH);
  public name: string;
  public deck: Deck;

  private socket: BroadcastOperator<
    DecorateAcknowledgementsWithMultipleResponses<DefaultEventsMap>,
    unknown
  >;

  public master: User['id'];
  public users: Record<User['id'], User> = {};

  public isPlaying = false;
  private round: Record<User['id'], ArrayElement<Deck['cards']>> = {};

  constructor(options: RoomOptions) {
    this.name = options.name;
    this.socket = options.socket.to(this.id);
    this.master = options.master.id;
    this.users[options.master.id] = options.master;
    this.deck = options.deck;

    options.master.socket!.join(this.id);
    this.socket.emit('joined', options.master.info);
  }

  public get info() {
    return {
      id: this.id,
      name: this.name,
      master: this.master,
      users: Object.values(this.users).map((user) => user.info),
      isPlaying: this.isPlaying,
      deck: this.deck,
    };
  }

  public destroy() {
    this.socket.emit('destroyed');
    this.socket.in(this.id).socketsLeave(this.id);
  }

  /*
   * User Management
   */
  public getUser(userId: string) {
    return this.users[userId];
  }

  public join(user: User) {
    if (this.users[user.id]) throw new WsException('User already in room');

    this.users[user.id] = user;

    if (!user.socket) throw new WsException('User does not have a socket connection');

    user.socket.join(this.id);
    this.socket.emit('joined', user.info);
  }

  public async leave(userId: string) {
    if (!this.users[userId]) throw new WsException("You're not in room");

    const user = this.getUser(userId);

    delete this.users[userId];
    delete this.round[userId];

    if (userId === this.master) {
      this.transferMaster(Object.values(this.users)[0]);
    }

    this.socket.emitWithAck('left', this.getUser(userId));

    if (!user.socket) throw new WsException('User does not have a socket connection');

    user.socket.leave(this.id);
  }

  public kick(userId: string) {
    if (!this.users[userId]) throw new WsException('User not in room');

    const user = this.getUser(userId);

    delete this.users[userId];
    delete this.round[userId];

    this.socket.emitWithAck('kicked', this.getUser(userId));

    if (!user.socket) throw new WsException('User does not have a socket connection');

    user.socket.leave(this.id);
  }

  public transferMaster(to: User) {
    if (!this.users[to.id]) throw new WsException('User not in room');

    this.master = to.id;
    this.socket.emit('new-master', to);
  }

  /*
   * Game Management
   */

  /*
   * Voting
   */
  /* private everyoneVoted() {
    return Object.keys(this.users).every((id) => this.round[id]);
  } */

  private someVoted() {
    return Object.keys(this.users).some((id) => this.round[id]);
  }

  public startNewRound() {
    if (this.isPlaying) throw new WsException('Game already started');

    this.isPlaying = true;
    this.round = {};
    this.socket.emit('round-started');
  }

  public vote(userId: string, card: ArrayElement<Deck['cards']>) {
    if (!this.users[userId]) throw new WsException('User not in room');
    if (!this.deck.cards.includes(card)) throw new WsException('Invalid card');

    this.round[userId] = card;

    this.socket.emit('voted', { user: this.getUser(userId) });
  }

  public changeVote(userId: string, card: ArrayElement<Deck['cards']>) {
    if (!this.users[userId]) throw new WsException('User not in room');
    if (!this.deck.cards.includes(card)) throw new WsException('Invalid card');

    this.round[userId] = card;

    this.socket.emit('changed-vote', { user: this.getUser(userId) });
  }

  public removeVote(id: string) {
    if (!this.users[id]) throw new WsException('User not in room');

    delete this.round[id];

    this.socket.emit('removed-vote', { user: this.getUser(id) });
  }

  public endRound() {
    if (!this.someVoted()) throw new WsException('No one voted');
    if (!this.isPlaying) throw new WsException('Game not started');

    const votes = Object.values(this.round);
    const result = votes.reduce(
      (acc, vote) => {
        acc[vote] = (acc[vote] || 0) + 1;
        return acc;
      },
      {} as Record<ArrayElement<(typeof this.deck)['cards']>, number>,
    );

    this.isPlaying = false;
    this.round = {};

    this.socket.emit('round-ended', result);
  }
}
