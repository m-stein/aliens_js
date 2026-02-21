import { Alien } from './alien.js';
import { GameObject } from './game_object.js';
import { randomInt } from './math.js';
import { Timeout } from './timeout.js';
import { Vector2 } from './vector_2.js';

export class AlienWave extends GameObject {
    /**
     * @param {{
     *   dstRect: import('./rectangle.js').Rectangle,
     *   alienLaserSfx: import('./audio_file.js').AudioFile,
     *   alienExplosionSfx: import('./audio_file.js').AudioFile,
     *   alienImg: import('./image_file.js').ImageFile,
     *   explosionImg: import('./image_file.js').ImageFile,
     *   alienBulletImg: import('./image_file.js').ImageFile
     *   minSpawnTimeoutMs: number,
     *   maxSpawnTimeoutMs: number
     * }} args
     */
    constructor(args) {
        super(new Vector2(0, 0), 'AlienWave');

        this._alienLaserSfx = args.alienLaserSfx;
        this._alienExplosionSfx = args.alienExplosionSfx;
        this._alienImg = args.alienImg;
        this._explosionImg = args.explosionImg;
        this._alienBulletImg = args.alienBulletImg;
        this._minSpawnTimeoutMs = args.maxSpawnTimeoutMs;
        this._maxSpawnTimeoutMs = args.maxSpawnTimeoutMs;

        /** @type {Alien[]} */
        this._aliens = [];

        /** @type {import('./alien_bullet.js').AlienBullet[]} */
        this._alienBullets = [];

        this._dstRect = args.dstRect;
        this._spawnTimeout = new Timeout(
            this._newSpawnTimeoutMs(),
            this._spawnAlien
        );
        this.addChild(this._spawnTimeout);
    }

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        this.updateChildren(elapsedMs);
    }

    /**
     * @param {import('drawing_context.js').DrawingContext} drawingContext
     */
    draw(drawingContext) {
        this.drawChildren(drawingContext);
    }

    /**
     * @param {((a: Alien) => void)} actionFn
     */
    forEachAlien(actionFn) {
        for (let idx = this._aliens.length - 1; idx >= 0; idx--) {
            actionFn(this._aliens[idx]);
        }
    }

    /**
     * @param {((b: import('./alien_bullet.js').AlienBullet) => void)} actionFn
     */
    forEachAlienBullet(actionFn) {
        for (let idx = this._alienBullets.length - 1; idx >= 0; idx--) {
            actionFn(this._alienBullets[idx]);
        }
    }

    _spawnAlien = () => {
        const alien = new Alien(
            this._dstRect,
            (bullet) => {
                this._alienBullets.push(bullet);
                this.addChild(bullet);
            },
            this._alienLaserSfx,
            this._alienExplosionSfx,
            this._alienImg,
            this._explosionImg,
            this._alienBulletImg
        );
        this._aliens.push(alien);
        this.addChild(alien);
        this._spawnTimeout.set(this._newSpawnTimeoutMs());
    };

    /**
     * @returns {number}
     */
    _newSpawnTimeoutMs() {
        return randomInt(this._minSpawnTimeoutMs, this._maxSpawnTimeoutMs);
    }

    /**
     * @param {Alien} alien
     */
    removeAlien = (alien) => {
        const idx = this._aliens.indexOf(alien);
        if (idx !== -1) {
            this._aliens.splice(idx, 1);
        }
        this.removeChild(alien);
    };

    /**
     * @param {import('./alien_bullet.js').AlienBullet} bullet
     */
    removeAlienBullet(bullet) {
        const idx = this._alienBullets.indexOf(bullet);
        if (idx !== -1) {
            this._alienBullets.splice(idx, 1);
        }
        this.removeChild(bullet);
    }
}
