import { GameObject } from './game_object.js';
import { Rectangle } from './rectangle.js';
import { DrawingContext } from './drawing_context.js';
import { Vector2 } from './vector_2.js';
import { clamp, randomInt } from './math.js';

export class Stars extends GameObject {
    constructor(brightness, speed, rect, numStars, htmlDocument) {
        super(rect.position, 'Stars');
        this.width = rect.width;
        this.height = rect.height * 3;
        this.numStars = numStars;
        const canvas = htmlDocument.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.localDrawCtx = new DrawingContext(canvas);
        this.yOffset = 0;
        this.speed = speed;
        this.drawToLocalDrawingContext(brightness);
    }

    drawToLocalDrawingContext(brightness) {
        const c = clamp(brightness * 256, 0, 255);
        const color = `rgb(${c},${c},${c})`;
        this.localDrawCtx.canvasContext.clearRect(
            0,
            0,
            this.width,
            this.height
        );
        for (let i = 0; i < this.numStars; i++) {
            const x = randomInt(0, this.width);
            const y = randomInt(0, this.height);
            const rect = new Rectangle(new Vector2(x, y), 1, 1);
            this.localDrawCtx.drawRect(rect, color);
        }
    }

    draw(drawingContext) {
        const ctx = drawingContext.canvasContext;
        const y = this.yOffset;

        ctx.drawImage(this.localDrawCtx.canvas, 0, y);
        ctx.drawImage(this.localDrawCtx.canvas, 0, y - this.height);
    }

    update(deltaTimeMs) {
        this.yOffset = (this.yOffset + deltaTimeMs * this.speed) % this.height;
    }
}
