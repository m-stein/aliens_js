import { randomInt } from 'jet/math.js';

/**
 * @template T
 * @typedef {object} TimedValuePhase
 * @property {number} ms
 * @property {T} value
 */

/**
 * @template T
 */
export class TimedValue {
    /**
     * @param {TimedValuePhase<T>[]} phases
     */
    constructor(phases) {
        this._phases = phases;
        this._phaseIdx = 0;
        this._remainingTimeMs = 0;
        this.startPhase(0);
    }

    /**
     * @param {number} phaseIdx
     */
    startPhase(phaseIdx) {
        this._phaseIdx = phaseIdx;
        this._remainingTimeMs = this._phases[phaseIdx].ms;
    }

    /**
     * @param {number} phaseIdx
     */
    startPhaseWithRandomTimeOffset(phaseIdx) {
        this._phaseIdx = phaseIdx;
        this._remainingTimeMs = randomInt(0, this._phases[phaseIdx].ms);
    }

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        if (this._remainingTimeMs == 0) {
            return;
        }
        while (this._remainingTimeMs <= elapsedMs) {
            elapsedMs -= this._remainingTimeMs;
            this.startPhase((this._phaseIdx + 1) % this._phases.length);
        }
        this._remainingTimeMs -= elapsedMs;
    }

    /**
     * @returns {T}
     */
    value() {
        return this._phases[this._phaseIdx].value;
    }

    /**
     * @param {import('drawing_context.js').DrawingContext} _drawingContext
     */
    draw(_drawingContext) {}
}
