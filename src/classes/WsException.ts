export default class WsException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WsException';
  }
}
