import { assertNotNull } from 'jet/assertions.js';
import { AlienWave } from './alien_wave.js';
import { AsteroidWave } from './asteroid_wave.js';
import { TurretWave } from './turret_wave.js';
import { Sequence } from './sequence.js';
import { GameObject } from 'jet/game_object.js';
import { Vector2 } from 'jet/vector_2.js';

export class Level1 extends GameObject {
    /**
     * @param {{
     *   dstRect: import('jet/rectangle.js').Rectangle,
     *   alienLaserSfx: import('jet/audio_file.js').AudioFile,
     *   alienExplosionSfx: import('jet/audio_file.js').AudioFile,
     *   alienImg: import('jet/image_file.js').ImageFile,
     *   explosionImg: import('jet/image_file.js').ImageFile,
     *   alienBulletImg: import('jet/image_file.js').ImageFile
     *   turretImg: import('jet/image_file.js').ImageFile
     *   playerImg: import('jet/image_file.js').ImageFile
     *   pressedKeys: Set<string>
     *   asteroidParams: {
     *      image: import('jet/image_file.js').ImageFile,
     *      collider: import('jet/rectangle.js').Rectangle,
     *   }[],
     * }} args,
     */
    constructor(args) {
        super(new Vector2(0, 0), 'Level1');
        this._sequence = new Sequence([
            {
                ms: 0,
                fn: () => {
                    this._alienWave = new AlienWave({
                        dstRect: args.dstRect,
                        alienExplosionSfx: args.alienExplosionSfx,
                        alienLaserSfx: args.alienLaserSfx,
                        alienBulletImg: args.alienBulletImg,
                        alienImg: args.alienImg,
                        explosionImg: args.explosionImg,
                        minSpawnTimeoutMs: 4000,
                        maxSpawnTimeoutMs: 6000,
                        onAlienSpawned: this._onAlienSpawned,
                    });
                    this.addChild(this._alienWave);
                    this._turretWave = new TurretWave({
                        dstRect: args.dstRect,
                        bulletImg: args.alienBulletImg,
                        turretImg: args.turretImg,
                        minSpawnTimeoutMs: 20000,
                        maxSpawnTimeoutMs: 40000,
                    });
                    this.addChild(this._turretWave);
                },
            },
            {
                ms: 10000,
                fn: () => {
                    this._asteroidWave = new AsteroidWave({
                        dstRect: args.dstRect,
                        asteroidParams: args.asteroidParams,
                        minSpawnTimeoutMs: 3000,
                        maxSpawnTimeoutMs: 6000,
                    });
                    this.addChild(this._asteroidWave);
                },
            },
            {
                ms: 20000,
                fn: () => {
                    assertNotNull(this._alienWave);
                    const alienWave = this._alienWave;
                    alienWave.windDown(() => {
                        this.removeChild(alienWave);
                        if (this._alienWave === alienWave) {
                            this._alienWave = null;
                        }
                    });
                },
            },
            {
                ms: 30000,
                fn: () => {
                    assertNotNull(this._asteroidWave);
                    const asteroidWave = this._asteroidWave;
                    asteroidWave.windDown(() => {
                        this.removeChild(asteroidWave);
                        if (this._asteroidWave === asteroidWave) {
                            this._asteroidWave = null;
                        }
                    });
                },
            },
            {
                ms: 35000,
                fn: () => {
                    assertNotNull(this._turretWave);
                    const turretWave = this._turretWave;
                    turretWave.windDown(() => {
                        this.removeChild(turretWave);
                        if (this._turretWave === turretWave) {
                            this._turretWave = null;
                        }
                    });
                },
            },
        ]);
        this.addChild(this._sequence);
    }

    /**
     * @param {number} _numAliensSpawned
     */
    _onAlienSpawned = (_numAliensSpawned) => {};

    /**
     * @param {import('./bullet.js').Bullet} bullet
     * @param {() => void} onHit
     * @param {() => void} onScored
     */
    handlePlayerBulletInteractions(bullet, onHit, onScored) {
        let hit = false;
        const alienWave = this._alienWave;
        if (alienWave) {
            alienWave.forEachAlien((alien) => {
                if (hit || !alien.vulnerable()) {
                    return;
                }
                if (bullet.collider().intersectsWith(alien.collider())) {
                    alien.startExplosion(alienWave.removeAlien);
                    onHit();
                    onScored();
                    hit = true;
                }
            });
        }
        if (hit) {
            return;
        }
        const turretWave = this._turretWave;
        if (turretWave) {
            turretWave.forEachTurret((turret) => {
                if (hit) {
                    return;
                }
                if (bullet.collider().intersectsWith(turret.collider())) {
                    onHit();
                    hit = true;
                }
            });
        }
        if (hit) {
            return;
        }
        const asteroidWave = this._asteroidWave;
        if (asteroidWave) {
            asteroidWave.forEachAsteroid((asteroid) => {
                if (hit) {
                    return;
                }
                if (bullet.collider().intersectsWith(asteroid.collider())) {
                    onHit();
                    hit = true;
                }
            });
        }
    }

    /**
     * @param {import('./player.js').Player | undefined} player
     * @param {() => void} onPlayerCollision
     */
    handleTurretInteractions(player = undefined, onPlayerCollision = () => {}) {
        const turretWave = this._turretWave;
        if (turretWave) {
            turretWave.forEachTurret((turret) => {
                if (turret.finishedManeuver()) {
                    turretWave.removeTurret(turret);
                } else if (
                    player?.vulnerable() &&
                    turret.collider().intersectsWith(player.collider())
                ) {
                    onPlayerCollision();
                }
            });
        }
    }

    /**
     * @param {import('./player.js').Player | undefined} player
     * @param {() => void} onPlayerHit
     */
    handleTurretBulletInteractions(player = undefined, onPlayerHit = () => {}) {
        const turretWave = this._turretWave;
        if (turretWave) {
            turretWave.forEachBullet((bullet) => {
                if (turretWave.bulletOutOfSight(bullet)) {
                    turretWave.removeBullet(bullet);
                } else if (
                    player?.vulnerable() &&
                    bullet.collider().intersectsWith(player.collider())
                ) {
                    turretWave.removeBullet(bullet);
                    onPlayerHit();
                }
            });
        }
    }

    /**
     * @param {import('./player.js').Player | undefined} player
     * @param {() => void} onPlayerCollision
     */
    handleAlienShipInteractions(
        player = undefined,
        onPlayerCollision = () => {}
    ) {
        const alienWave = this._alienWave;
        if (alienWave) {
            alienWave.forEachAlien((alien) => {
                if (alien.finishedManeuver()) {
                    alienWave.removeAlien(alien);
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
    }

    /**
     * @param {import('./player.js').Player | undefined} player
     * @param {() => void} onPlayerCollision
     */
    handleAsteroidInteractions(
        player = undefined,
        onPlayerCollision = () => {}
    ) {
        const asteroidWave = this._asteroidWave;
        if (asteroidWave) {
            asteroidWave.forEachAsteroid((asteroid) => {
                if (asteroid.finishedManeuver()) {
                    asteroidWave.removeAsteroid(asteroid);
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
    }

    /**
     * @param {import('./player.js').Player | undefined} player
     * @param {() => void} onPlayerHit
     */
    handleAlienBulletInteractions(player = undefined, onPlayerHit = () => {}) {
        const alienWave = this._alienWave;
        if (alienWave) {
            alienWave.forEachAlienBullet((bullet) => {
                if (bullet.outOfSight()) {
                    alienWave.removeAlienBullet(bullet);
                } else if (player) {
                    if (!player.vulnerable()) {
                        return;
                    }
                    if (bullet.collider().intersectsWith(player.collider())) {
                        alienWave.removeAlienBullet(bullet);
                        onPlayerHit();
                    }
                }
            });
        }
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
}
