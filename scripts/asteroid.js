import { GameObject } from 'jet/game_object.js';
import { DRAW_COLLIDERS, DRAW_COLLIDERS_COLOR } from './parameters.js';
import { Rectangle } from 'jet/rectangle.js';
import { Sprite } from 'jet/sprite.js';
import { Vector2 } from 'jet/vector_2.js';

export class Asteroid extends GameObject {
    /**
     * @param {import('jet/rectangle.js').Rectangle} dstRect
     * @param {import('jet/image_file.js').ImageFile} image
     * @param {Vector2} position
     * @param {Vector2} speed
     * @param {Rectangle} collider
     */
    constructor(dstRect, image, position, speed, collider) {
        let size = new Vector2(
            image.htmlElement.width,
            image.htmlElement.height
        );
        super(position.copy(), 'Asteroid');
        this._sprite = new Sprite(image);
        this._dstRect = dstRect;
        this._size = size;
        this._speed = speed;
        this._collider = collider;
        this.addChild(this._sprite);
    }

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        this.position.x += this._speed.x * elapsedMs;
        this.position.y += this._speed.y * elapsedMs;
        this.updateChildren(elapsedMs);
    }

    /**
     * @param {import('drawing_context.js').DrawingContext} drawingContext
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
    finishedManeuver() {
        return this.position.y > this._dstRect.height;
    }

    /**
     * @returns {Rectangle}
     */
    collider() {
        return new Rectangle(
            this._collider.position.copy().add(this.position),
            this._collider.width,
            this._collider.height
        );
    }
}
