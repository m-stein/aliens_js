import { GameObject } from './game_object.js';
import { Timeout } from './timeout.js';

export class PeriodicTimeout extends GameObject {
    /**
     * @param {number} ms
     * @param {(() => void) | null} action
     */
    constructor(ms = 0, action = null) {
        super(null, 'PeriodicTimeout');

        /** @type {number} */
        this._ms = ms;

        /** @type {(() => void) | null} */
        this._action = action;

        /** @type {Timeout} */
        this._timeout = new Timeout(this._ms, () => {
            this._action?.();
            this._timeout.set(this._ms);
        });
        this.addChild(this._timeout);
    }

    /**
     * @param {number} ms
     * @param {(() => void) | null} action
     */
    set(ms = 0, action = null) {
        this._ms = ms;
        if (action !== null) {
            this._action = action;
        }
        this._timeout.set(this._ms, this._action);
    }

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        this.updateChildren(elapsedMs);
    }

    draw(_drawingContext) {}

    /**
     * @returns {boolean}
     */
    running() {
        return this._timeout.running();
    }
}
