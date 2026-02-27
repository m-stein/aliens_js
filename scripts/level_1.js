import { AlienWave } from './alien_wave.js';
import { GameObject } from './game_object.js';
import { Vector2 } from './vector_2.js';

export class Level1 extends GameObject {
    /**
     * @param {{
     *   dstRect: import('./rectangle.js').Rectangle,
     *   alienLaserSfx: import('./audio_file.js').AudioFile,
     *   alienExplosionSfx: import('./audio_file.js').AudioFile,
     *   alienImg: import('./image_file.js').ImageFile,
     *   explosionImg: import('./image_file.js').ImageFile,
     *   alienBulletImg: import('./image_file.js').ImageFile
     * }} args
     */
    constructor(args) {
        super(new Vector2(0, 0), 'Level1');
        this.alienWave = new AlienWave({
            ...args,
            minSpawnTimeoutMs: 2000,
            maxSpawnTimeoutMs: 3000,
            onAlienSpawned: this._onAlienSpawned,
        });
        this.addChild(this.alienWave);
    }

    /**
     * @param {number} numAliensSpawned
     */
    _onAlienSpawned = (numAliensSpawned) => {
        switch (numAliensSpawned) {
            case 5: // +5
                this.alienWave.changeConfig(1800, 2800);
                break;
            case 11: // +6
                this.alienWave.changeConfig(1600, 2600);
                break;
            case 18: // +7
                this.alienWave.changeConfig(1400, 2400);
                break;
            case 26: // +8
                this.alienWave.changeConfig(1200, 2200);
                break;
            case 35: // +9
                this.alienWave.changeConfig(1000, 2000);
                break;
            case 45: // + 10
                this.alienWave.changeConfig(800, 1800);
                break;
            case 56: // + 11
                this.alienWave.changeConfig(600, 1600);
                break;
            case 68: // + 12
                this.alienWave.changeConfig(400, 1400);
                break;
            case 81: // + 13
                this.alienWave.changeConfig(200, 1200);
                break;
        }
    };

    /**
     * @param {import('./bullet.js').Bullet} bullet
     * @param {() => void} onHit
     */
    handlePlayerBulletInteractions(bullet, onHit) {
        this.alienWave.forEachAlien((alien) => {
            if (!alien.vulnerable()) {
                return;
            }
            if (bullet.collider().intersectsWith(alien.collider())) {
                alien.startExplosion(this.alienWave.removeAlien);
                onHit();
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
        this.alienWave.forEachAlien((alien) => {
            if (alien.finishedManeuver()) {
                this.alienWave.removeAlien(alien);
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
     * @param {() => void} onPlayerHit
     */
    handleAlienBulletInteractions(player = undefined, onPlayerHit = () => {}) {
        this.alienWave.forEachAlienBullet((bullet) => {
            if (bullet.outOfSight()) {
                this.alienWave.removeAlienBullet(bullet);
            } else if (player) {
                if (!player.vulnerable()) {
                    return;
                }
                if (bullet.collider().intersectsWith(player.collider())) {
                    this.alienWave.removeAlienBullet(bullet);
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
