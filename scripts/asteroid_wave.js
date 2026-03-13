import { getRandomItem } from './array_utilities.js';
import { Asteroid } from './asteroid.js';
import { GameObject } from './game_object.js';
import { randomInt } from './math.js';
import { Timeout } from './timeout.js';
import { Vector2 } from 'jus/vector_2.js';

export class AsteroidWave extends GameObject {
    /**
     * @param {{
     *   dstRect: import('./rectangle.js').Rectangle,
     *   asteroidParams: {
     *      image: import('./image_file.js').ImageFile,
     *      collider: import('./rectangle.js').Rectangle,
     *   }[],
     *   minSpawnTimeoutMs: number,
     *   maxSpawnTimeoutMs: number
     * }} args
     */
    constructor(args) {
        super(new Vector2(0, 0), 'AsteroidWave');
        this._dstRect = args.dstRect;
        this._asteroidParams = args.asteroidParams;
        this._minSpawnTimeoutMs = args.minSpawnTimeoutMs;
        this._maxSpawnTimeoutMs = args.maxSpawnTimeoutMs;
        this._spawnAtY = 0;
        for (const param of this._asteroidParams) {
            const spawnAtY = -param.image.htmlElement.height;
            if (this._spawnAtY > spawnAtY) {
                this._spawnAtY = spawnAtY;
            }
        }
        /** @type {Asteroid[]} */
        this._asteroids = [];
        this._spawnTimeout = new Timeout(
            this._newSpawnTimeoutMs(),
            this._spawnAsteroid
        );
        this.addChild(this._spawnTimeout);
    }

    /**
     * @param {((a: Asteroid) => void)} actionFn
     */
    forEachAsteroid(actionFn) {
        for (let idx = this._asteroids.length - 1; idx >= 0; idx--) {
            actionFn(this._asteroids[idx]);
        }
    }

    /**
     * @param {Asteroid} asteroid
     */
    removeAsteroid = (asteroid) => {
        const idx = this._asteroids.indexOf(asteroid);
        if (idx !== -1) {
            this._asteroids.splice(idx, 1);
        }
        this.removeChild(asteroid);
    };

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
     * @param {import('drawing_context.js').DrawingContext} drawingContext
     */
    draw(drawingContext) {
        this.drawChildren(drawingContext);
    }

    _spawnAsteroid = () => {
        const params = getRandomItem(this._asteroidParams);
        const asteroid = new Asteroid(
            this._dstRect,
            params.image,
            new Vector2(
                randomInt(-100, this._dstRect.width + 100),
                this._spawnAtY
            ),
            new Vector2(randomInt(-5, 5) / 1000, randomInt(20, 50) / 1000),
            params.collider
        );
        this._asteroids.push(asteroid);
        this.addChild(asteroid);
        this._spawnTimeout.set(this._newSpawnTimeoutMs());
    };

    /**
     * @returns {number}
     */
    _newSpawnTimeoutMs() {
        return randomInt(this._minSpawnTimeoutMs, this._maxSpawnTimeoutMs);
    }
}
