import { GameObject } from './game_object.js';

export class Timeout extends GameObject {
    /**
     * @param {number} durationMs
     * @param {() => void} callback
     */
    constructor(durationMs, callback) {
        super(null, 'Timeout');

        this.durationMs = durationMs;
        this.remainingMs = durationMs;
        this.callback = callback;
        this.finished = false;
    }

    /**
     * @param {number} deltaMs
     */
    update(deltaMs) {
        if (this.finished) {
            return;
        }
        this.remainingMs -= deltaMs;
        if (this.remainingMs <= 0) {
            this.finished = true;
            if (this.callback) {
                this.callback();
            }
        }
    }

    draw(_drawingContext) {}

    reset() {
        this.remainingMs = this.durationMs;
        this.finished = false;
    }
}
