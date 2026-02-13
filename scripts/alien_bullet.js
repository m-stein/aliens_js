import { GameObject } from './game_object.js';
import { DRAW_COLLIDERS, DRAW_COLLIDERS_COLOR } from './parameters.js';
import { Rectangle } from './rectangle.js';
import { Sprite } from './sprite.js';
import { TimedValue } from './timed_value.js';
import { Vector2 } from './vector_2.js';

export class AlienBullet extends GameObject {
    /**
     * @param {Vector2} rifleTip
     * @param {number} fbHeight
     * @param {import('./image_file.js').ImageFile} image
     */
    constructor(rifleTip, fbHeight, image) {
        super(rifleTip.copy(), 'AlienBullet');
        this._width = 8;
        this._height = 8;
        this._fbHeight = fbHeight;

        this.position = new Vector2(
            rifleTip.x - this._width / 2,
            rifleTip.y - this._height
        );

        this._speed = 200.0 / 1000;

        this._colliderOffset = new Vector2(1, 1);
        this._colliderSize = new Vector2(6, 6);

        this._sprite = new Sprite(image, new Vector2(8, 8), 6, 1);
        const frameMs = 100;
        this._frameIdx = new TimedValue([
            { ms: frameMs, value: 0 },
            { ms: frameMs, value: 1 },
            { ms: frameMs, value: 2 },
            { ms: frameMs, value: 3 },
            { ms: frameMs, value: 4 },
            { ms: frameMs, value: 5 },
        ]);
        this.addChild(this._sprite);
        this.addChild(this._frameIdx);
    }

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        this.updateChildren(elapsedMs);
        this.position.y += this._speed * elapsedMs;
        this._sprite.goToFrame(this._frameIdx.value());
    }

    /**
     * @param {import('./drawing_context.js').DrawingContext} drawingContext
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
        return this.position.y > this._fbHeight;
    }

    /**
     * @returns {Rectangle}
     */
    collider() {
        return new Rectangle(
            new Vector2(
                this.position.x + this._colliderOffset.x,
                this.position.y + this._colliderOffset.y
            ),
            this._colliderSize.x,
            this._colliderSize.y
        );
    }
}
