import { AlienWave } from './alien_wave.js';
import { AsteroidWave } from './asteroid_wave.js';
import { GameObject } from './game_object.js';
import { Vector2 } from 'jus/vector_2.js';

export class Level1 extends GameObject {
    /**
     * @param {{
     *   dstRect: import('./rectangle.js').Rectangle,
     *   alienLaserSfx: import('./audio_file.js').AudioFile,
     *   alienExplosionSfx: import('./audio_file.js').AudioFile,
     *   alienImg: import('./image_file.js').ImageFile,
     *   explosionImg: import('./image_file.js').ImageFile,
     *   alienBulletImg: import('./image_file.js').ImageFile
     *   asteroidParams: {
     *      image: import('./image_file.js').ImageFile,
     *      collider: import('./rectangle.js').Rectangle,
     *   }[],
     * }} args,
     */
    constructor(args) {
        super(new Vector2(0, 0), 'Level1');
        this._asteroidWave = new AsteroidWave({
            dstRect: args.dstRect,
            asteroidParams: args.asteroidParams,
            minSpawnTimeoutMs: 3000,
            maxSpawnTimeoutMs: 6000,
        });
        this.addChild(this._asteroidWave);
        this._alienWave = new AlienWave({
            ...args,
            minSpawnTimeoutMs: 4000,
            maxSpawnTimeoutMs: 6000,
            onAlienSpawned: this._onAlienSpawned,
        });
        this.addChild(this._alienWave);
    }

    /**
     * @param {number} _numAliensSpawned
     */
    _onAlienSpawned = (_numAliensSpawned) => {
        /*
        switch (numAliensSpawned) {
            case 5: // +5
                this._alienWave.changeConfig(1800, 2800);
                break;
            case 11: // +6
                this._alienWave.changeConfig(1600, 2600);
                break;
            case 18: // +7
                this._alienWave.changeConfig(1400, 2400);
                break;
            case 26: // +8
                this._alienWave.changeConfig(1200, 2200);
                break;
            case 35: // +9
                this._alienWave.changeConfig(1000, 2000);
                break;
            case 45: // + 10
                this._alienWave.changeConfig(800, 1800);
                break;
            case 56: // + 11
                this._alienWave.changeConfig(600, 1600);
                break;
            case 68: // + 12
                this._alienWave.changeConfig(400, 1400);
                break;
            case 81: // + 13
                this._alienWave.changeConfig(200, 1200);
                break;
        }
                */
    };

    /**
     * @param {import('./bullet.js').Bullet} bullet
     * @param {() => void} onHit
     * @param {() => void} onScored
     */
    handlePlayerBulletInteractions(bullet, onHit, onScored) {
        let hit = false;
        this._alienWave.forEachAlien((alien) => {
            if (hit || !alien.vulnerable()) {
                return;
            }
            if (bullet.collider().intersectsWith(alien.collider())) {
                alien.startExplosion(this._alienWave.removeAlien);
                onHit();
                onScored();
                hit = true;
            }
        });
        if (hit) {
            return;
        }
        this._asteroidWave.forEachAsteroid((asteroid) => {
            if (hit) {
                return;
            }
            if (bullet.collider().intersectsWith(asteroid.collider())) {
                onHit();
                hit = true;
            }
        });
    }

    /**
     * @param {import('./player.js').Player | undefined} player
     * @param {() => void} onPlayerCollision
     */
    handleAlienShipInteractions(
        player = undefined,
        onPlayerCollision = () => {}
    ) {
        this._alienWave.forEachAlien((alien) => {
            if (alien.finishedManeuver()) {
                this._alienWave.removeAlien(alien);
            } else if (player) {
                if (!player.vulnerable()) {
                    return;
                }
                if (alien.collider().intersectsWith(player.collider())) {
                    onPlayerCollision();
                }
            }
        });
    }

    /**
     * @param {import('./player.js').Player | undefined} player
     * @param {() => void} onPlayerCollision
     */
    handleAsteroidInteractions(
        player = undefined,
        onPlayerCollision = () => {}
    ) {
        this._asteroidWave.forEachAsteroid((asteroid) => {
            if (asteroid.finishedManeuver()) {
                this._asteroidWave.removeAsteroid(asteroid);
            } else if (player) {
                if (!player.vulnerable()) {
                    return;
                }
                if (asteroid.collider().intersectsWith(player.collider())) {
                    onPlayerCollision();
                }
            }
        });
    }

    /**
     * @param {import('./player.js').Player | undefined} player
     * @param {() => void} onPlayerHit
     */
    handleAlienBulletInteractions(player = undefined, onPlayerHit = () => {}) {
        this._alienWave.forEachAlienBullet((bullet) => {
            if (bullet.outOfSight()) {
                this._alienWave.removeAlienBullet(bullet);
            } else if (player) {
                if (!player.vulnerable()) {
                    return;
                }
                if (bullet.collider().intersectsWith(player.collider())) {
                    this._alienWave.removeAlienBullet(bullet);
                    onPlayerHit();
                }
            }
        });
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
}
