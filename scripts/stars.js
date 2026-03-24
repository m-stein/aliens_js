import { GameObject } from 'jet/game_object.js';
import { Rectangle } from 'jet/rectangle.js';
import { DrawingContext } from 'jet/drawing_context.js';
import { Vector2 } from 'jet/vector_2.js';
import { clamp, randomInt } from 'jet/math.js';

export class Stars extends GameObject {
    /**
     *
     * @param {number} brightness
     * @param {number} speed
     * @param {Rectangle} rect
     * @param {number} numStars
     * @param {HTMLDocument} htmlDocument
     */
    constructor(brightness, speed, rect, numStars, htmlDocument) {
        super(rect.position, 'Stars');
        this._width = rect.width;
        this._height = rect.height * 3;
        this._numStars = numStars;
        const canvas = htmlDocument.createElement('canvas');
        canvas.width = this._width;
        canvas.height = this._height;
        this._localDrawCtx = new DrawingContext(canvas);
        this._yOffset = 0;
        this._speed = speed;
        this._drawToLocalDrawingContext(brightness);
    }

    /**
     * @param {number} brightness
     */
    _drawToLocalDrawingContext(brightness) {
        const c = clamp(brightness * 256, 0, 255);
        const color = `rgb(${c},${c},${c})`;
        this._localDrawCtx.canvasContext.clearRect(
            0,
            0,
            this._width,
            this._height
        );
        for (let i = 0; i < this._numStars; i++) {
            const x = randomInt(0, this._width);
            const y = randomInt(0, this._height);
            const rect = new Rectangle(new Vector2(x, y), 1, 1);
            this._localDrawCtx.drawRect(rect, color);
        }
    }

    /**
     * @param {import('jet/drawing_context.js').DrawingContext} drawingContext
     */
    draw(drawingContext) {
        const ctx = drawingContext.canvasContext;
        const y = this._yOffset;

        ctx.drawImage(this._localDrawCtx.canvas, 0, y);
        ctx.drawImage(this._localDrawCtx.canvas, 0, y - this._height);
    }

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        this._yOffset =
            (this._yOffset + elapsedMs * this._speed) % this._height;
    }
}
