import { GameObject } from './game_object.js';
import { Vector2 } from './vector_2.js';
import { Sprite } from './sprite.js';
import { TimedValue } from './timed_value.js';
import { Rectangle } from './rectangle.js';
import { AlienBullet } from './alien_bullet.js';

const AlienState = Object.freeze({
    ALIVE: 0,
    EXPLODING: 1,
    DESTROYED: 2,
});

export class Alien extends GameObject {
    constructor(
        envRect,
        addBulletFn,
        laserSound,
        explosionSound,
        ufoImg,
        explosionImg,
        bulletImg
    ) {
        super(new Vector2(0, 32), 'Alien');

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

        this.state = AlienState.ALIVE;
        this.colliderOffset = new Vector2(5, 6);
        this.colliderSize = new Vector2(22, 13);

        this.explosionSound = explosionSound;
        this.explosionSprite = new Sprite({
            position: new Vector2(0, 0),
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
        this.laserSfx = laserSound;
        this.ySpeed = Alien._randomUniform(20.0, 60.0) / 1000;
        this.curveFreqFactor = 1 / (this.ySpeed * 1000);

        this.maxCurveAmplFactor =
            this.envRect.width / 2 - this.ufoSprite.frameSize.x / 2;
        this.curveAmplFactor = Alien._randomUniform(
            this.maxCurveAmplFactor / 2,
            this.maxCurveAmplFactor
        );

        this.curveHorizontalShift =
            -this.ufoSprite.frameSize.x / 2 + this.envRect.width / 2;
        this.curveVerticalShift = Alien._randomUniform(0, 360);

        this.fireTimeout = Alien._newFireTimeout();
        this.addBulletFn = addBulletFn;

        this.addChild(this.ufoFrameIdx);
        this.addChild(this.ufoSprite);
    }
    draw(drawingContext) {
        this.drawChildren(drawingContext);
    }

    update(deltaTime) {
        this.updateChildren(deltaTime);
        switch (this.state) {
            case AlienState.ALIVE:
                this.ufoSprite.currFrameIndex = this.ufoFrameIdx.value();
                if (this.fireTimeout > deltaTime) {
                    this.fireTimeout -= deltaTime;
                } else {
                    this._fireBullet();
                    this.fireTimeout = Alien._newFireTimeout();
                }
                this.position.y = this.position.y + this.ySpeed * deltaTime;
                this.position.x =
                    this.curveAmplFactor *
                        Math.sin(
                            (this.position.y - this.curveVerticalShift) *
                                this.curveFreqFactor
                        ) +
                    this.curveHorizontalShift;
                break;

            case AlienState.EXPLODING:
                this.explosionSprite.currFrameIndex =
                    this.explosionFrameIdx.value();
                if (this.explosionFrameIdx.value() == 20) {
                    this.explosionFinishedFn();
                }
                if (this.ufoSprite !== null) {
                    this.ufoSprite.currFrameIndex = this.ufoFrameIdx.value();
                    if (this.explosionFrameIdx.value() >= 10) {
                        this.removeChild(this.ufoSprite);
                        this.ufoSprite = null;
                    }
                }
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
        const sound = this.laserSfx.htmlElement;
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
        this.state = AlienState.EXPLODING;
        this.addChild(this.explosionSprite);
        this.addChild(this.explosionFrameIdx);

        const sound = this.explosionSound.htmlElement;
        sound.pause();
        sound.currentTime = 0;
        sound.play();
    }

    vulnerable() {
        return this.state === AlienState.ALIVE;
    }

    destroyed() {
        return this.state === AlienState.DESTROYED;
    }
}
