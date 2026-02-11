import { GameObject } from './game_object.js';
import { Sprite } from './sprite.js';
import { Vector2 } from './vector_2.js';

export class Camera extends GameObject {
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

    update(elapsedMs) {
        this.updateChildren(elapsedMs);
    }

    draw(drawingContext) {
        this.drawChildren(drawingContext);
    }
}
