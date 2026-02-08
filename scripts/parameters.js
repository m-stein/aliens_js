import { Vector2 } from './vector_2.js';

/* Debugging */
export const DRAW_COLLIDERS = false;
export const DRAW_COLLIDERS_COLOR = 'rgb(255,0,0)';

/* Score board appearance */
export const SCORE_BOARD_PADDING = new Vector2(4, 2);
export const SCORE_BOARD_BORDER_SIZE = 1;
export const SCORE_BOARD_BORDER_COLOR = 'rgba(184, 184, 73)';
export const SCORE_BOARD_FILL_COLOR = 'rgb(0,0,0)';

/* Scoring */
export const SCORE_PER_HIT = 6;
export const SCORE_BONUS_INCR_PER_HIT = 4;
export const SCORE_BONUS_DECR_PER_MISS = 2;
export const SCORE_BONUS_DIV_PER_DEATH = 2;
