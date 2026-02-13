import { Alien } from './alien.js';
import { GameObject } from './game_object.js';
import { randomInt } from './math.js';
import { Timeout } from './timeout.js';
import { Vector2 } from './vector_2.js';

const MIN_ALIEN_SPAWN_TIMEOUT_MS = 500;
const MAX_ALIEN_SPAWN_TIMEOUT_MS = 1500;

export class AlienWave extends GameObject {
    /**
     * @param {import('./rectangle.js').Rectangle} dstRect
     * @param {import('./audio_file.js').AudioFile} alienLaserSfx
     * @param {import('./audio_file.js').AudioFile} alienExplosionSfx
     * @param {import('./image_file.js').ImageFile} alienImg
     * @param {import('./image_file.js').ImageFile} explosionImg
     * @param {import('./image_file.js').ImageFile} alienBulletImg
     */
    constructor(
        dstRect,
        alienLaserSfx,
        alienExplosionSfx,
        alienImg,
        explosionImg,
        alienBulletImg
    ) {
        super(new Vector2(0, 0), 'AlienWave');

        this._alienLaserSfx = alienLaserSfx;
        this._alienExplosionSfx = alienExplosionSfx;
        this._alienImg = alienImg;
        this._explosionImg = explosionImg;
        this._alienBulletImg = alienBulletImg;

        /** @type {Alien[]} */
        this._aliens = [];

        /** @type {import('./alien_bullet.js').AlienBullet[]} */
        this._alienBullets = [];

        this._dstRect = dstRect;
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
        return randomInt(
            MIN_ALIEN_SPAWN_TIMEOUT_MS,
            MAX_ALIEN_SPAWN_TIMEOUT_MS
        );
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
