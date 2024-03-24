import { ERROR_CODES } from '../constants';

export default class WsException extends Error {
  constructor(public code: (typeof ERROR_CODES)[keyof typeof ERROR_CODES]) {
    super(code);
  }
}
