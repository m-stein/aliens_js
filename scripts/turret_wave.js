import { GameObject } from 'jet/game_object.js';
import { randomInt } from 'jet/math.js';
import { Timeout } from 'jet/timeout.js';
import { Vector2 } from 'jet/vector_2.js';
import { Turret } from './turret.js';

export class TurretWave extends GameObject {
    /**
     * @param {{
     *   dstRect: import('jet/rectangle.js').Rectangle,
     *   bulletImg: import('jet/image_file.js').ImageFile,
     *   turretImg: import('jet/image_file.js').ImageFile,
     *   minSpawnTimeoutMs: number,
     *   maxSpawnTimeoutMs: number
     * }} args
     */
    constructor(args) {
        super(new Vector2(0, 0), 'TurretWave');
        this._dstRect = args.dstRect;
        this._bulletImg = args.bulletImg;
        this._turretImg = args.turretImg;
        this._minSpawnTimeoutMs = args.minSpawnTimeoutMs;
        this._maxSpawnTimeoutMs = args.maxSpawnTimeoutMs;

        /** @type {Turret[]} */
        this._turrets = [];
        /** @type {import('./alien_bullet.js').AlienBullet[]} */
        this._bullets = [];
        /** @type {(() => void) | null} */
        this._onWindDownFinished = null;

        this._spawnTimeout = new Timeout(
            this._newSpawnTimeoutMs(),
            this._spawnTurret
        );
        this.addChild(this._spawnTimeout);
    }

    /**
     * @param {(turret: Turret) => void} actionFn
     */
    forEachTurret(actionFn) {
        for (let idx = this._turrets.length - 1; idx >= 0; idx--) {
            actionFn(this._turrets[idx]);
        }
    }

    /**
     * @param {(bullet: import('./alien_bullet.js').AlienBullet) => void} actionFn
     */
    forEachBullet(actionFn) {
        for (let idx = this._bullets.length - 1; idx >= 0; idx--) {
            actionFn(this._bullets[idx]);
        }
    }

    /**
     * @param {Turret} turret
     */
    removeTurret = (turret) => {
        const idx = this._turrets.indexOf(turret);
        if (idx !== -1) {
            this._turrets.splice(idx, 1);
        }
        this.removeChild(turret);
        this._finishWindDownIfPossible();
    };

    /**
     * @param {import('./alien_bullet.js').AlienBullet} bullet
     */
    removeBullet(bullet) {
        const idx = this._bullets.indexOf(bullet);
        if (idx !== -1) {
            this._bullets.splice(idx, 1);
        }
        this.removeChild(bullet);
    }

    /**
     * @param {import('./alien_bullet.js').AlienBullet} bullet
     * @returns {boolean}
     */
    bulletOutOfSight(bullet) {
        const collider = bullet.collider();
        return (
            collider.right < this._dstRect.left ||
            collider.left > this._dstRect.right ||
            collider.bottom < this._dstRect.top ||
            collider.top > this._dstRect.bottom
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
     * @param {() => void} onFinished
     */
    windDown(onFinished) {
        this.removeChild(this._spawnTimeout);
        this._onWindDownFinished = onFinished;
        this._finishWindDownIfPossible();
    }

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        this.updateChildren(elapsedMs);
    }

    /**
     * @param {import('jet/drawing_context.js').DrawingContext} drawingContext
     */
    draw(drawingContext) {
        this.drawChildren(drawingContext);
    }

    _spawnTurret = () => {
        const turretSize = 32;
        const turret = new Turret({
            envRect: this._dstRect,
            position: new Vector2(
                randomInt(this._dstRect.left, this._dstRect.right - turretSize),
                this._dstRect.top - turretSize
            ),
            addBulletFn: (bullet) => {
                this._bullets.push(bullet);
                this.addChild(bullet);
            },
            bulletImg: this._bulletImg,
            turretImg: this._turretImg,
        });
        this._turrets.push(turret);
        this.addChild(turret);
        this._spawnTimeout.set(this._newSpawnTimeoutMs());
    };

    _finishWindDownIfPossible() {
        if (this._onWindDownFinished === null || this._turrets.length > 0) {
            return;
        }
        const onFinished = this._onWindDownFinished;
        this._onWindDownFinished = null;
        onFinished();
    }

    /**
     * @returns {number}
     */
    _newSpawnTimeoutMs() {
        return randomInt(this._minSpawnTimeoutMs, this._maxSpawnTimeoutMs);
    }
}
