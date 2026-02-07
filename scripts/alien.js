import { GameObject } from './game_object.js';
import { Vector2 } from './vector_2.js';
import { Sprite } from './sprite.js';
import { TimedValue } from './timed_value.js';
import { Rectangle } from './rectangle.js';
import { AlienBullet } from './alien_bullet.js';
import { createEnum } from './enum.js';

export class Alien extends GameObject {
    static State = createEnum({
        Alive: 0,
        Exploding1: 1,
        Exploding2: 2,
        Destroyed: 3,
    });

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

        this.ufoSprite = new Sprite({
            position: new Vector2(0, 0),
            sourceImage: ufoImg,
            frameSize: new Vector2(32, 32),
            numColumns: 3,
            numRows: 1,
            drawFrameIndex: 0,
        });
        this.ufoFrameIdx = new TimedValue([
            { ms: 100, value: 0 },
            { ms: 100, value: 1 },
            { ms: 100, value: 2 },
        ]);
        this.envRect = envRect;

        this.state = Alien.State;
        this.colliderOffset = new Vector2(5, 6);
        this.colliderSize = new Vector2(22, 13);

        this.explosionSound = explosionSound;
        this.explosionSprite = new Sprite({
            position: new Vector2(1, 0),
            sourceImage: explosionImg,
            frameSize: new Vector2(32, 32),
            numColumns: 21,
            numRows: 1,
            drawFrameIndex: 0,
        });
        const frameMs = 30;
        this.explosionFrameIdx = new TimedValue([
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

        this.bulletImg = bulletImg;
        this.laserSound = laserSound;

        this.maxCurveAmplFactor =
            this.envRect.width / 2 - this.ufoSprite.frameSize.x / 2;

        this.curveHorizontalShift =
            -this.ufoSprite.frameSize.x / 2 + this.envRect.width / 2;

        this.addBulletFn = addBulletFn;
        this.state = Alien.State.Alive;
        this.respawn();
        this.addChild(this.ufoFrameIdx);
        this.addChild(this.ufoSprite);
    }

    respawn() {
        this.fireTimeout = Alien._newFireTimeout();
        this.ySpeed = Alien._randomUniform(20.0, 60.0) / 1000;
        this.curveFreqFactor = 1 / (this.ySpeed * 1000);
        this.curveVerticalShift = Alien._randomUniform(0, 360);
        this.curveAmplFactor = Alien._randomUniform(
            this.maxCurveAmplFactor / 2,
            this.maxCurveAmplFactor
        );
        this.position = new Vector2(0, -32);
        this._updatePosition(0);
        switch (this.state) {
            case Alien.State.Alive:
                break;

            case Alien.State.Exploding1:
                this.removeChild(this.explosionSprite);
                this.removeChild(this.explosionFrameIdx);
                this.state = Alien.State.Alive;
                break;

            case Alien.State.Exploding2:
                this.removeChild(this.explosionSprite);
                this.removeChild(this.explosionFrameIdx);
                this.addChild(this.ufoFrameIdx);
                this.addChild(this.ufoSprite);
                this.state = Alien.State.Alive;
                break;

            case Alien.State.Destroyed:
                this.addChild(this.ufoFrameIdx);
                this.addChild(this.ufoSprite);
                this.state = Alien.State.Alive;
                break;
        }
    }

    draw(drawingContext) {
        this.drawChildren(drawingContext);
    }

    _updatePosition(elapsedMs) {
        this.position.y = this.position.y + this.ySpeed * elapsedMs;
        this.position.x =
            this.curveAmplFactor *
                Math.sin(
                    (this.position.y - this.curveVerticalShift) *
                        this.curveFreqFactor
                ) +
            this.curveHorizontalShift;
    }

    update(elapsedMs) {
        this.updateChildren(elapsedMs);
        switch (this.state) {
            case Alien.State.Alive:
                this.ufoSprite.currFrameIndex = this.ufoFrameIdx.value();
                if (this.fireTimeout > elapsedMs) {
                    this.fireTimeout -= elapsedMs;
                } else {
                    this._fireBullet();
                    this.fireTimeout = Alien._newFireTimeout();
                }
                this._updatePosition(elapsedMs);
                break;

            case Alien.State.Exploding1:
                this.explosionSprite.currFrameIndex =
                    this.explosionFrameIdx.value();
                if (this.explosionFrameIdx.value() < 10) {
                    this.ufoSprite.currFrameIndex = this.ufoFrameIdx.value();
                } else {
                    this.removeChild(this.ufoSprite);
                    this.removeChild(this.ufoFrameIdx);
                    this.state = Alien.State.Exploding2;
                }
                break;

            case Alien.State.Exploding2:
                this.explosionSprite.currFrameIndex =
                    this.explosionFrameIdx.value();
                if (this.explosionFrameIdx.value() >= 20) {
                    this.removeChild(this.explosionSprite);
                    this.removeChild(this.explosionFrameIdx);
                    this.state = Alien.State.Destroyed;
                    this.explosionFinishedFn(this);
                }
                break;

            case Alien.State.Destroyed:
                break;
        }
    }

    static _randomUniform(min, max) {
        return min + Math.random() * (max - min);
    }

    static _newFireTimeout() {
        return Alien._randomUniform(1.0, 5.0) * 1000;
    }

    _fireBullet() {
        const c = this.collider();
        const midBottom = new Vector2(
            c.position.x + c.width / 2,
            c.position.y + c.height
        );

        this.addBulletFn(
            new AlienBullet(midBottom, this.envRect.height, this.bulletImg)
        );
        const sound = this.laserSound.htmlElement;
        sound.pause();
        sound.currentTime = 0;
        sound.play();
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

    finishedManeuver() {
        return this.position.y > this.envRect.height;
    }

    /**
     * @param {function} finishedFn
     */
    startExplosion(finishedFn) {
        this.explosionFinishedFn = finishedFn;
        this.state = Alien.State.Exploding1;
        this.explosionFrameIdx.startPhase(0);
        this.addChild(this.explosionSprite);
        this.addChild(this.explosionFrameIdx);

        const sound = this.explosionSound.htmlElement;
        sound.pause();
        sound.currentTime = 0;
        sound.play();
    }

    vulnerable() {
        return this.state === Alien.State.Alive;
    }
}
