import { GameObject } from 'jet/game_object.js';
import { Vector2 } from 'jet/vector_2.js';

export class Sequence extends GameObject {
    /**
     * @param {{ ms: number, fn: () => void }[]} entries
     */
    constructor(entries = []) {
        super(new Vector2(0, 0), 'Sequence');

        this._entries = [...entries].sort((a, b) => a.ms - b.ms);
        this._elapsedMs = 0;
        this._nextEntryIdx = 0;
    }

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        this._elapsedMs += elapsedMs;

        while (
            this._nextEntryIdx < this._entries.length &&
            this._entries[this._nextEntryIdx].ms <= this._elapsedMs
        ) {
            const entry = this._entries[this._nextEntryIdx];
            this._nextEntryIdx++;
            entry.fn();
        }
    }

    /**
     * @param {import('jet/drawing_context.js').DrawingContext} _drawingContext
     */
    draw(_drawingContext) {}
}
