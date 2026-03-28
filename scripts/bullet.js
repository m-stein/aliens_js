import { GameObject } from 'jet/game_object.js';
import { DRAW_COLLIDERS, DRAW_COLLIDERS_COLOR } from './parameters.js';
import { Rectangle } from 'jet/rectangle.js';
import { Sprite } from 'jet/sprite.js';
import { Vector2 } from 'jet/vector_2.js';

export class Bullet extends GameObject {
    /**
     * @param {Vector2} rifleTip
     * @param {import('jet/image_file.js').ImageFile} image
     */
    constructor(rifleTip, image) {
        let size = new Vector2(3, 7);
        super(
            new Vector2(rifleTip.x - size.x / 2, rifleTip.y - size.y),
            'Bullet'
        );
        this._sprite = new Sprite(image);
        this._size = size;
        this._speed = 600.0 / 1000;
        this._colliderOffset = this._sprite.position.copy();
        this.addChild(this._sprite);
    }

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        this.position.y -= this._speed * elapsedMs;
        this.updateChildren(elapsedMs);
    }

    /**
     * @param {import('jet/drawing_context.js').DrawingContext} drawingContext
     */
    draw(drawingContext) {
        this.drawChildren(drawingContext);
        if (DRAW_COLLIDERS) {
            drawingContext.drawRect(this.collider(), DRAW_COLLIDERS_COLOR);
        }
    }

    /**
     * @returns {boolean}
     */
    outOfSight() {
        return this.position.y < -this._size.y;
    }

    /**
     * @returns {Rectangle}
     */
    collider() {
        return new Rectangle(this.position.copy(), this._size.x, this._size.y);
    }
}
