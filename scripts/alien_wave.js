import { Alien } from './alien.js';
import { GameObject } from './game_object.js';
import { randomInt } from 'jet/math.js';
import { Timeout } from './timeout.js';
import { Vector2 } from 'jet/vector_2.js';

export class AlienWave extends GameObject {
    /**
     * @param {{
     *   dstRect: import('jet/rectangle.js').Rectangle,
     *   alienLaserSfx: import('jet/audio_file.js').AudioFile,
     *   alienExplosionSfx: import('jet/audio_file.js').AudioFile,
     *   alienImg: import('./image_file.js').ImageFile,
     *   explosionImg: import('./image_file.js').ImageFile,
     *   alienBulletImg: import('./image_file.js').ImageFile
     *   minSpawnTimeoutMs: number,
     *   maxSpawnTimeoutMs: number
     *   onAlienSpawned: (numAliensSpawned: number) => void
     * }} args
     */
    constructor(args) {
        super(new Vector2(0, 0), 'AlienWave');

        this._alienLaserSfx = args.alienLaserSfx;
        this._alienExplosionSfx = args.alienExplosionSfx;
        this._alienImg = args.alienImg;
        this._explosionImg = args.explosionImg;
        this._alienBulletImg = args.alienBulletImg;
        this._minSpawnTimeoutMs = args.minSpawnTimeoutMs;
        this._maxSpawnTimeoutMs = args.maxSpawnTimeoutMs;
        this._numAliensSpawned = 0;
        this._onAlienSpawned = args.onAlienSpawned;

        const alienWidth = 32;
        this._maxCurveAmplFactor = args.dstRect.width / 2 - alienWidth / 2;
        this._ySpeed = 0;
        this._curveFreqFactor = 0;
        this._curveVerticalShift = 0;
        this._curveAmplFactor = 0;

        this._burstMaxCount = 5;
        this._burstIntervalMs = 300;
        this._burstActive = false;
        this._burstCount = 0;
        this._burstTimeout = new Timeout(this._burstIntervalMs, () => {
            if (this._burstActive) {
                this._spawnAlien();
                this._burstCount++;
                if (this._burstCount >= this._burstMaxCount) {
                    this._deactivateBurst();
                }
            }
            this._burstTimeout.set(this._burstIntervalMs);
        });
        this.addChild(this._burstTimeout);

        /** @type {Alien[]} */
        this._aliens = [];

        /** @type {import('./alien_bullet.js').AlienBullet[]} */
        this._alienBullets = [];

        this._dstRect = args.dstRect;
        this._spawnTimeout = new Timeout(
            this._newSpawnTimeoutMs(),
            this._activateBurst
        );
        this.addChild(this._spawnTimeout);
    }

    _setNewAlienMovementParams() {
        this._ySpeed = randomInt(20.0, 60.0) / 1000;
        this._curveFreqFactor = 1 / (this._ySpeed * 1000);
        this._curveVerticalShift = randomInt(0, 360);
        this._curveAmplFactor = randomInt(
            this._maxCurveAmplFactor / 2,
            this._maxCurveAmplFactor
        );
    }

    /**
     * @param {number} minSpawnTimeoutMs
     * @param {number} maxSpawnTimeoutMs
     */
    changeConfig(minSpawnTimeoutMs, maxSpawnTimeoutMs) {
        this._minSpawnTimeoutMs = minSpawnTimeoutMs;
        this._maxSpawnTimeoutMs = maxSpawnTimeoutMs;
    }

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        this.updateChildren(elapsedMs);
    }

    /**
     * @param {import('./drawing_context.js').DrawingContext} drawingContext
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

    _activateBurst = () => {
        this._setNewAlienMovementParams();
        this._burstActive = true;
        this._burstCount = 0;
        this._spawnTimeout.set(this._newSpawnTimeoutMs());
    };

    _deactivateBurst = () => {
        this._burstActive = false;
    };

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
            this._alienBulletImg,
            this._ySpeed,
            this._curveFreqFactor,
            this._curveVerticalShift,
            this._curveAmplFactor
        );
        this._aliens.push(alien);
        this.addChild(alien);
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
