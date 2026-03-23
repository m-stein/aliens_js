import { GameObject } from 'jet/game_object.js';
import { Vector2 } from 'jet/vector_2.js';
import { Rectangle } from 'jet/rectangle.js';
import { AlienBullet } from './alien_bullet.js';
import { Timeout } from './timeout.js';
import { lerp } from 'jet/math.js';

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
     */
    constructor(envRect, bulletImg) {
        super(new Vector2(50, 50), 'Turret');

        this._bulletImg = bulletImg;
        this._envRect = envRect;

        /** @type {import('./alien_bullet.js').AlienBullet[]} */
        this._bullets = [];
        this._timeout = new Timeout(200, () => {
            this._fireBullet();
        });
        this.addChild(this._timeout);

        this.durationMs = 3100;
        this.elapsed = 0;
        this.angle = 0; // current angle (0–360)
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
        this.elapsed = (this.elapsed + elapsedMs) % this.durationMs;

        const t = this.elapsed / this.durationMs; // 0..1
        this.angle = t * 360; // 0..360
    }

    _fireBullet() {
        const bullet = new AlienBullet(
            this.position.copy(),
            this._envRect.height,
            this._bulletImg,
            angleToUnitVector(this.angle),
            50 / 1000
        );
        this._bullets.push(bullet);
        this.addChild(bullet);
        this._timeout.set(200);
    }
}
