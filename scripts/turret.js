import { GameObject } from 'jet/game_object.js';
import { Vector2 } from 'jet/vector_2.js';
import { Rectangle } from 'jet/rectangle.js';
import { AlienBullet } from './alien_bullet.js';
import { Timeout } from 'jet/timeout.js';
import { Sprite } from 'jet/sprite.js';
import { TimedValue } from 'jet/timed_value.js';
import { angleToUnitVector } from 'jet/math.js';
import { DRAW_COLLIDERS, DRAW_COLLIDERS_COLOR } from './parameters.js';

export class Turret extends GameObject {
    /**
     * @param {{
     *   envRect: Rectangle,
     *   position: Vector2,
     *   addBulletFn: (bullet: AlienBullet) => void,
     *   bulletImg: import('jet/image_file.js').ImageFile,
     *   turretImg: import('jet/image_file.js').ImageFile
     * }} args
     */
    constructor(args) {
        super(args.position.copy(), 'Turret');

        this._addBulletFn = args.addBulletFn;
        this._bulletImg = args.bulletImg;
        this._envRect = args.envRect;
        this._fireIntervalMs = 200;

        this._timeout = new Timeout(this._fireIntervalMs, () => {
            this._fireBullet();
        });
        this.addChild(this._timeout);
        this._turretFrameIdx = new TimedValue([
            { ms: 60, value: 0 },
            { ms: 60, value: 1 },
            { ms: 60, value: 2 },
            { ms: 60, value: 3 },
            { ms: 60, value: 4 },
            { ms: 60, value: 5 },
            { ms: 60, value: 6 },
            { ms: 60, value: 7 },
        ]);
        this.addChild(this._turretFrameIdx);
        this._colliderOffset = new Vector2(8, 8);
        this._colliderSize = new Vector2(16, 16);

        this._turretSprite = new Sprite(
            args.turretImg,
            new Vector2(32, 32),
            8,
            1
        );
        this.addChild(this._turretSprite);

        this._fireRotationDurationMs = 3100;
        this._fireRotationElapsedMs = 0;
        this._fireRotationAngle = 0;
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
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        this.updateChildren(elapsedMs);
        this._turretSprite.goToFrame(this._turretFrameIdx.value());
        this.position.y += elapsedMs / 100;

        this._fireRotationElapsedMs =
            (this._fireRotationElapsedMs + elapsedMs) %
            this._fireRotationDurationMs;
        const t = this._fireRotationElapsedMs / this._fireRotationDurationMs;
        this._fireRotationAngle = t * 360;
    }

    _fireBullet() {
        this._addBulletFn(
            new AlienBullet(
                new Vector2(this.position.x + 16, this.position.y + 20),
                this._envRect.height,
                this._bulletImg,
                angleToUnitVector(this._fireRotationAngle),
                50 / 1000
            )
        );
        this._timeout.set(this._fireIntervalMs);
    }

    /**
     * @returns {boolean}
     */
    finishedManeuver() {
        return this.position.y > this._envRect.bottom;
    }

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
