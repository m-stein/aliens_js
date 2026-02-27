import { GameObject } from './game_object.js';
import { Vector2 } from './vector_2.js';

export class Timeout extends GameObject {
    /**
     * @param {number} ms
     * @param {(() => void) | null} action
     */
    constructor(ms = 0, action = null) {
        super(new Vector2(0, 0), 'Timeout');

        /** @type {(() => void) | null} */
        this._action = action;

        /** @type {number} */
        this._ms = ms;
    }

    /**
     * @param {number} ms
     * @param {(() => void) | null} action
     */
    set(ms, action = null) {
        this._ms = ms;
        if (action !== null) {
            this._action = action;
        }
    }

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        while (this.running() && elapsedMs > 0) {
            if (this._ms > elapsedMs) {
                this._ms -= elapsedMs;
                elapsedMs = 0;
            } else {
                elapsedMs -= this._ms;
                this._ms = 0;
                this._action?.();
            }
        }
    }

    draw(_drawingContext) {}

    /**
     * @returns {boolean}
     */
    running() {
        return this._ms > 0;
    }
}
