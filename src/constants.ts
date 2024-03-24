export const SERVER_TO_CLIENT_EVENTS = [] as const;

export const CLIENT_TO_SERVER_EVENTS = ['join'] as const;

export const ERROR_CODES = {
  // Validation Errors
  invalidData: 'invalid_data',
  invalidCard: 'invalid_card',

  // Game Errors
  gameAlreadyStarted: 'game_already_started',
  gameNotStarted: 'game_not_started',
  noOneVoted: 'no_one_voted',

  // Room Errors
  roomNotFound: 'room_not_found',

  // User Errors
  userAlreadyInRoom: 'user_already_in_room',
  userNotInRoom: 'user_not_in_room',
  userNotFound: 'user_not_found',
  userDoesNotOwnRoom: 'user_does_not_own_room',
  userDoesNotHaveSocket: 'user_does_not_have_socket',

  // Misc
  unknownError: 'unknown_error',
} as const;

export const ROOM_ID_LENGTH = 6 as const;
export const USER_ID_LENGTH = 8 as const;

export const MAX_ROOM_NAME_LENGTH = 80 as const;
export const MIN_ROOM_NAME_LENGTH = 1 as const;
