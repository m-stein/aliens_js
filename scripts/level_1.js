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
            minSpawnTimeoutMs: 1000,
            maxSpawnTimeoutMs: 1500,
        });
        this.addChild(this.alienWave);
    }

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
