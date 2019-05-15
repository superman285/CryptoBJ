// change this if needed
export const SOCKETS_PORT = ':3000';

// dont touch things below
export const HAND_LEFT = 'left';
export const HAND_RIGHT = 'right';
export const PLAYER_WIN = 'win';
export const PLAYER_LOSS = 'loss';
export const PLAYER_TIE = 'tie';
export const NEED_RESTART = 'needRestart';
export const CARD_REVEAL_ANIMATION_SPEED = 0.7; // in seconds, default 0.7
export const CARD_FLIP_ANIMATION_SPEED = 0.6; // how fast card flips in css at blackjack/css/cards.scss .playing_card (transition speed)
export const CARD_LEAVE_ANIMATION_SPEED = 0.5; // in seconds, default 0.5
// NOTE - integer(CARD_LEAVE_ANIMATION_SPEED + CARD_FLIP_ANIMATION_SPEED) must match value in Cards.scss leave-card-leave-active

// export const CARD_NOT_VISIBLE = 0;
// export const CARD_HIDDEN_ON_TABLE = 1;
// export const CARD_VISIBLE = 2;

export const CARD_STATE_HIDDEN = 0;
export const CARD_STATE_FACE_DOWN = 1;
export const CARD_STATE_FACE_UP = 2;
export const CARD_STATE_AWAY = 3;