import { GameObject } from './game_object.js';
import { DRAW_COLLIDERS, DRAW_COLLIDERS_COLOR } from './parameters.js';
import { Rectangle } from './rectangle.js';
import { Sprite } from './sprite.js';
import { TimedValue } from './timed_value.js';
import { Vector2 } from './vector_2.js';

export class AlienBullet extends GameObject {
    constructor(rifleTip, fbHeight, image) {
        super(rifleTip.copy(), 'AlienBullet');
        this.width = 8;
        this.height = 8;
        this.fbHeight = fbHeight;

        this.position = new Vector2(
            rifleTip.x - this.width / 2,
            rifleTip.y - this.height
        );

        this.speed = 200.0 / 1000;

        this.colliderOffset = new Vector2(1, 1);
        this.colliderSize = new Vector2(6, 6);

        this.sprite = new Sprite({
            position: new Vector2(0, 0),
            sourceImage: image,
            frameSize: new Vector2(8, 8),
            numColumns: 6,
            numRows: 1,
            drawFrameIndex: 0,
        });
        const frameMs = 100;
        this.frameIdx = new TimedValue([
            { ms: frameMs, value: 0 },
            { ms: frameMs, value: 1 },
            { ms: frameMs, value: 2 },
            { ms: frameMs, value: 3 },
            { ms: frameMs, value: 4 },
            { ms: frameMs, value: 5 },
        ]);
        this.addChild(this.sprite);
        this.addChild(this.frameIdx);
    }

    update(elapsedMs) {
        this.updateChildren(elapsedMs);
        this.position.y += this.speed * elapsedMs;
        this.sprite.currFrameIndex = this.frameIdx.value();
    }

    /**
     * @param {DrawingContext} drawingContext
     */
    draw(drawingContext) {
        this.drawChildren(drawingContext);
        if (DRAW_COLLIDERS) {
            drawingContext.drawRect(this.collider(), DRAW_COLLIDERS_COLOR);
        }
    }

    outOfSight() {
        return this.position.y > this.fbHeight;
    }

    collider() {
        return new Rectangle(
            new Vector2(
                this.position.x + this.colliderOffset.x,
                this.position.y + this.colliderOffset.y
            ),
            this.colliderSize.x,
            this.colliderSize.y
        );
    }
}
