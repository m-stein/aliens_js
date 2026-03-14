import { GameObject } from 'jet/game_object.js';
import { Sprite } from './sprite.js';
import { Vector2 } from 'jet/vector_2.js';

export class Camera extends GameObject {
    /**
     * @param {import('./image_file.js').ImageFile} backgroundImg
     * @param {number} width
     * @param {number} height
     */
    constructor(backgroundImg, width, height) {
        super(new Vector2(0, 0), 'Camera');
        if (backgroundImg !== null) {
            this.backgroundSprite = new Sprite(
                backgroundImg,
                new Vector2(width, height)
            );
            this.addChild(this.backgroundSprite);
        }
    }

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        this.updateChildren(elapsedMs);
    }

    /**
     * @param {import('drawing_context.js').DrawingContext} drawingContext
     */
    draw(drawingContext) {
        this.drawChildren(drawingContext);
    }
}
