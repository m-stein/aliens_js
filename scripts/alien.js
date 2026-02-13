import { GameObject } from './game_object.js';
import { Vector2 } from './vector_2.js';
import { Sprite } from './sprite.js';
import { TimedValue } from './timed_value.js';
import { Rectangle } from './rectangle.js';
import { AlienBullet } from './alien_bullet.js';
import { createEnum } from './enum.js';
import { DRAW_COLLIDERS, DRAW_COLLIDERS_COLOR } from './parameters.js';
import { randomInt } from './math.js';

const MIN_ALIEN_FIRE_TIMEOUT_MS = 1000;
const MAX_ALIEN_FIRE_TIMEOUT_MS = 5000;

export class Alien extends GameObject {
    static State = createEnum({
        Alive: 0,
        Exploding1: 1,
        Exploding2: 2,
        Destroyed: 3,
    });

    /**
     * @param {((b: import('./alien_bullet.js').AlienBullet) => void)} addBulletFn
     */

    /**
     * @param {Rectangle} envRect
     * @param {((b: import('./alien_bullet.js').AlienBullet) => void)} addBulletFn
     * @param {import('./audio_file.js').AudioFile} laserSound
     * @param {import('./audio_file.js').AudioFile} explosionSound
     * @param {import('./image_file.js').ImageFile} ufoImg
     * @param {import('./image_file.js').ImageFile} explosionImg
     * @param {import('./image_file.js').ImageFile} bulletImg
     */
    constructor(
        envRect,
        addBulletFn,
        laserSound,
        explosionSound,
        ufoImg,
        explosionImg,
        bulletImg
    ) {
        super(new Vector2(0, 0), 'Alien');

        this._ySpeed = 0;
        this._curveFreqFactor = 0;
        this._fireTimeout = 0;
        this._curveAmplFactor = 0;
        this._curveVerticalShift = 0;

        /** @type {((a: Alien) => void)} */
        this.explosionFinishedFn = (_a) => {};
        this._ufoSprite = new Sprite(ufoImg, new Vector2(32, 32), 3, 1);
        this._ufoFrameIdx = new TimedValue([
            { ms: 100, value: 0 },
            { ms: 100, value: 1 },
            { ms: 100, value: 2 },
        ]);
        this._envRect = envRect;
        this._colliderOffset = new Vector2(5, 6);
        this._colliderSize = new Vector2(22, 13);

        this._explosionSound = explosionSound;
        this._explosionSprite = new Sprite(
            explosionImg,
            new Vector2(32, 32),
            21,
            1
        );
        const frameMs = 30;
        this._explosionFrameIdx = new TimedValue([
            { ms: frameMs, value: 0 },
            { ms: frameMs, value: 1 },
            { ms: frameMs, value: 2 },
            { ms: frameMs, value: 3 },
            { ms: frameMs, value: 4 },
            { ms: frameMs, value: 5 },
            { ms: frameMs, value: 6 },
            { ms: frameMs, value: 7 },
            { ms: frameMs, value: 8 },
            { ms: frameMs, value: 9 },
            { ms: frameMs, value: 10 },
            { ms: frameMs, value: 11 },
            { ms: frameMs, value: 12 },
            { ms: frameMs, value: 13 },
            { ms: frameMs, value: 14 },
            { ms: frameMs, value: 15 },
            { ms: frameMs, value: 16 },
            { ms: frameMs, value: 17 },
            { ms: frameMs, value: 18 },
            { ms: frameMs, value: 19 },
            { ms: 10000000, value: 20 },
        ]);

        this._bulletImg = bulletImg;
        this._laserSound = laserSound;

        this._maxCurveAmplFactor =
            this._envRect.width / 2 - this._ufoSprite.frameWidth() / 2;

        this._curveHorizontalShift =
            -this._ufoSprite.frameWidth() / 2 + this._envRect.width / 2;

        this._addBulletFn = addBulletFn;
        this._state = Alien.State.Alive;
        this.respawn();
        this.addChild(this._ufoFrameIdx);
        this.addChild(this._ufoSprite);
    }

    respawn() {
        this._fireTimeout = Alien._newFireTimeout();
        this._ySpeed = randomInt(20.0, 60.0) / 1000;
        this._curveFreqFactor = 1 / (this._ySpeed * 1000);
        this._curveVerticalShift = randomInt(0, 360);
        this._curveAmplFactor = randomInt(
            this._maxCurveAmplFactor / 2,
            this._maxCurveAmplFactor
        );
        this.position = new Vector2(0, -32);
        this._updatePosition(0);
        switch (this._state) {
            case Alien.State.Alive:
                break;

            case Alien.State.Exploding1:
                this.removeChild(this._explosionSprite);
                this.removeChild(this._explosionFrameIdx);
                this._state = Alien.State.Alive;
                break;

            case Alien.State.Exploding2:
                this.removeChild(this._explosionSprite);
                this.removeChild(this._explosionFrameIdx);
                this.addChild(this._ufoFrameIdx);
                this.addChild(this._ufoSprite);
                this._state = Alien.State.Alive;
                break;

            case Alien.State.Destroyed:
                this.addChild(this._ufoFrameIdx);
                this.addChild(this._ufoSprite);
                this._state = Alien.State.Alive;
                break;
        }
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
     * @param {number} elapsedMs
     */
    _updatePosition(elapsedMs) {
        this.position.y = this.position.y + this._ySpeed * elapsedMs;
        this.position.x =
            this._curveAmplFactor *
                Math.sin(
                    (this.position.y - this._curveVerticalShift) *
                        this._curveFreqFactor
                ) +
            this._curveHorizontalShift;
    }

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        this.updateChildren(elapsedMs);
        switch (this._state) {
            case Alien.State.Alive:
                this._ufoSprite.goToFrame(this._ufoFrameIdx.value());
                if (this._fireTimeout > elapsedMs) {
                    this._fireTimeout -= elapsedMs;
                } else {
                    this._fireBullet();
                    this._fireTimeout = Alien._newFireTimeout();
                }
                this._updatePosition(elapsedMs);
                break;

            case Alien.State.Exploding1:
                this._explosionSprite.goToFrame(
                    this._explosionFrameIdx.value()
                );
                if (this._explosionFrameIdx.value() < 10) {
                    this._ufoSprite.goToFrame(this._ufoFrameIdx.value());
                } else {
                    this.removeChild(this._ufoSprite);
                    this.removeChild(this._ufoFrameIdx);
                    this._state = Alien.State.Exploding2;
                }
                break;

            case Alien.State.Exploding2:
                this._explosionSprite.goToFrame(
                    this._explosionFrameIdx.value()
                );
                if (this._explosionFrameIdx.value() >= 20) {
                    this.removeChild(this._explosionSprite);
                    this.removeChild(this._explosionFrameIdx);
                    this._state = Alien.State.Destroyed;
                    this.explosionFinishedFn(this);
                }
                break;

            case Alien.State.Destroyed:
                break;
        }
    }

    /**
     * @returns {number}
     */
    static _newFireTimeout() {
        return randomInt(MIN_ALIEN_FIRE_TIMEOUT_MS, MAX_ALIEN_FIRE_TIMEOUT_MS);
    }

    _fireBullet() {
        this._addBulletFn(
            new AlienBullet(
                this.collider().bottomCenter(),
                this._envRect.height,
                this._bulletImg
            )
        );
        const sound = this._laserSound.htmlElement;
        sound.pause();
        sound.currentTime = 0;
        sound.play();
    }

    /**
     * @returns {Rectangle}
     */
    collider() {
        switch (this._state) {
            case Alien.State.Alive:
            case Alien.State.Exploding1:
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
     * @returns {boolean}
     */
    finishedManeuver() {
        return this.position.y > this._envRect.height;
    }

    /**
     * @param {((a: Alien) => void)} finishedFn
     */
    startExplosion(finishedFn) {
        this.explosionFinishedFn = finishedFn;
        this._state = Alien.State.Exploding1;
        this._explosionFrameIdx.startPhase(0);
        this.addChild(this._explosionSprite);
        this.addChild(this._explosionFrameIdx);

        const sound = this._explosionSound.htmlElement;
        sound.pause();
        sound.currentTime = 0;
        sound.play();
    }

    /**
     * @returns {boolean}
     */
    vulnerable() {
        return this._state === Alien.State.Alive;
    }
}
