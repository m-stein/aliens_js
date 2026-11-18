import { GameObject } from 'jet/game_object.js';
import { Vector2 } from 'jet/vector_2.js';
import { Rectangle } from 'jet/rectangle.js';
import { AlienBullet } from './alien_bullet.js';
import { Timeout } from 'jet/timeout.js';
import { Sprite } from 'jet/sprite.js';
import { TimedValue } from 'jet/timed_value.js';
import { angleToUnitVector } from 'jet/math.js';
import { createEnum } from 'jet/enum.js';
import { DRAW_COLLIDERS, DRAW_COLLIDERS_COLOR } from './parameters.js';

export class Turret extends GameObject {
    static State = createEnum({
        Alive: 0,
        Exploding1: 1,
        Exploding2: 2,
        Destroyed: 3,
    });

    /**
     * @param {{
     *   envRect: Rectangle,
     *   position: Vector2,
     *   addBulletFn: (bullet: AlienBullet) => void,
     *   bulletImg: import('jet/image_file.js').ImageFile,
     *   turretImg: import('jet/image_file.js').ImageFile,
     *   explosionSound: import('jet/audio_file.js').AudioFile,
     *   explosionImg: import('jet/image_file.js').ImageFile
     * }} args
     */
    constructor(args) {
        super(args.position.copy(), 'Turret');

        this._addBulletFn = args.addBulletFn;
        this._bulletImg = args.bulletImg;
        this._envRect = args.envRect;
        this._fireIntervalMs = 200;
        this._numHits = 0;
        this._state = Turret.State.Alive;
        /** @type {((turret: Turret) => void)} */
        this._explosionFinishedFn = (_turret) => {};

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

        this._explosionSound = args.explosionSound;
        this._explosionSprite = new Sprite(
            args.explosionImg,
            new Vector2(32, 32),
            21,
            1
        );
        const explosionFrameMs = 30;
        this._explosionFrameIdx = new TimedValue([
            { ms: explosionFrameMs, value: 0 },
            { ms: explosionFrameMs, value: 1 },
            { ms: explosionFrameMs, value: 2 },
            { ms: explosionFrameMs, value: 3 },
            { ms: explosionFrameMs, value: 4 },
            { ms: explosionFrameMs, value: 5 },
            { ms: explosionFrameMs, value: 6 },
            { ms: explosionFrameMs, value: 7 },
            { ms: explosionFrameMs, value: 8 },
            { ms: explosionFrameMs, value: 9 },
            { ms: explosionFrameMs, value: 10 },
            { ms: explosionFrameMs, value: 11 },
            { ms: explosionFrameMs, value: 12 },
            { ms: explosionFrameMs, value: 13 },
            { ms: explosionFrameMs, value: 14 },
            { ms: explosionFrameMs, value: 15 },
            { ms: explosionFrameMs, value: 16 },
            { ms: explosionFrameMs, value: 17 },
            { ms: explosionFrameMs, value: 18 },
            { ms: explosionFrameMs, value: 19 },
            { ms: 10000000, value: 20 },
        ]);

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
        switch (this._state) {
            case Turret.State.Alive: {
                this._turretSprite.goToFrame(this._turretFrameIdx.value());
                this.position.y += elapsedMs / 100;

                this._fireRotationElapsedMs =
                    (this._fireRotationElapsedMs + elapsedMs) %
                    this._fireRotationDurationMs;
                const t =
                    this._fireRotationElapsedMs / this._fireRotationDurationMs;
                this._fireRotationAngle = t * 360;
                break;
            }

            case Turret.State.Exploding1:
                this._explosionSprite.goToFrame(
                    this._explosionFrameIdx.value()
                );
                if (this._explosionFrameIdx.value() < 10) {
                    this._turretSprite.goToFrame(this._turretFrameIdx.value());
                } else {
                    this.removeChild(this._turretSprite);
                    this.removeChild(this._turretFrameIdx);
                    this._state = Turret.State.Exploding2;
                }
                break;

            case Turret.State.Exploding2:
                this._explosionSprite.goToFrame(
                    this._explosionFrameIdx.value()
                );
                if (this._explosionFrameIdx.value() >= 20) {
                    this.removeChild(this._explosionSprite);
                    this.removeChild(this._explosionFrameIdx);
                    this._state = Turret.State.Destroyed;
                    this._explosionFinishedFn(this);
                }
                break;

            case Turret.State.Destroyed:
                break;
        }
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
        switch (this._state) {
            case Turret.State.Alive:
            case Turret.State.Exploding1:
                return new Rectangle(
                    new Vector2(
                        this.position.x + this._colliderOffset.x,
                        this.position.y + this._colliderOffset.y
                    ),
                    this._colliderSize.x,
                    this._colliderSize.y
                );
        }
        return new Rectangle(new Vector2(0, 0), 0, 0);
    }

    /**
     * @param {((turret: Turret) => void)} finishedFn
     * @returns {boolean} Whether this hit destroyed the turret.
     */
    hit(finishedFn) {
        if (!this.vulnerable()) {
            return false;
        }

        this._numHits++;
        if (this._numHits < 2) {
            return false;
        }

        this._explosionFinishedFn = finishedFn;
        this._state = Turret.State.Exploding1;
        this.removeChild(this._timeout);
        this._explosionFrameIdx.startPhase(0);
        this.addChild(this._explosionSprite);
        this.addChild(this._explosionFrameIdx);

        const sound = this._explosionSound.htmlElement;
        sound.pause();
        sound.currentTime = 0;
        sound.play();
        return true;
    }

    /**
     * @returns {boolean}
     */
    vulnerable() {
        return this._state === Turret.State.Alive;
    }
}
