import { GameObject } from 'jet/game_object.js';
import { Vector2 } from 'jet/vector_2.js';
import { Rectangle } from 'jet/rectangle.js';
import { AlienBullet } from './alien_bullet.js';
import { Timeout } from 'jet/timeout.js';
import { Sprite } from 'jet/sprite.js';
import { ContainerObject } from './container_object.js';
import { TimedValue } from 'jet/timed_value.js';

/**
 * Returns a normalized 2D vector (length = 1) for a given angle in degrees.
 * @param {number} degrees
 * @returns {Vector2}
 */
export function angleToUnitVector(degrees) {
    const radians = degrees * (Math.PI / 180);
    const x = Math.cos(radians);
    const y = Math.sin(radians);
    return new Vector2(x, y);
}

export class Turret extends GameObject {
    /**
     * @param {Rectangle} envRect
     * @param {import('jet/image_file.js').ImageFile} bulletImg
     * @param {import('jet/image_file.js').ImageFile} turretImg
     */
    constructor(envRect, bulletImg, turretImg) {
        super(new Vector2(50, 50), 'Turret');

        this._bulletImg = bulletImg;
        this._turretImg = turretImg;
        this._envRect = envRect;
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

        this._bulletContainer = new ContainerObject();
        this.addChild(this._bulletContainer);

        this._turretSprite = new Sprite(turretImg, new Vector2(32, 32), 8, 1);
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
    }

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        this.updateChildren(elapsedMs);
        this._turretSprite.goToFrame(this._turretFrameIdx.value());
        this.position.y += elapsedMs / 100;

        this._fireRotationElapsedMs = (this._fireRotationElapsedMs + elapsedMs) % this._fireRotationDurationMs;
        const t = this._fireRotationElapsedMs / this._fireRotationDurationMs;
        this._fireRotationAngle = t * 360;
        this._bulletContainer.forEachChild((child) => {
            const absPos = child.position.copy().add(this.position);
            if (absPos.x <= this._envRect.left - 8 ||
                absPos.x >= this._envRect.right ||
                absPos.y <= this._envRect.top - 8 ||
                absPos.y >= this._envRect.bottom 
            ) {
                this._bulletContainer.removeChild(child);
            }
        });
    }

    _fireBullet() {
        const bullet = new AlienBullet(
            new Vector2(16, 20),
            this._envRect.height,
            this._bulletImg,
            angleToUnitVector(this._fireRotationAngle),
            50 / 1000
        );
        this._bulletContainer.addChild(bullet);
        this._timeout.set(this._fireIntervalMs);
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
