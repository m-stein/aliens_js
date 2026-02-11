import { GameEngine } from './game_engine.js';
import { GameObject } from './game_object.js';
import { Vector2 } from './vector_2.js';
import { Camera } from './camera.js';
import { Rectangle } from './rectangle.js';
import { ImageFile } from './image_file.js';
import { removeItem } from './array_utilities.js';
import { Server } from './server.js';
import { Player } from './player.js';
import { Stars } from './stars.js';
import { Settings } from './settings.js';
import { Bullet } from './bullet.js';
import { AudioFile } from './audio_file.js';
import { SpriteFont } from './sprite_font.js';
import { Char } from './char.js';
import {
    FONT_LINE_HEIGHT,
    SCORE_BONUS_DECR_PER_MISS,
    SCORE_BONUS_DIV_PER_DEATH,
    SCORE_BONUS_INCR_PER_HIT,
    SCORE_PER_HIT,
} from './parameters.js';
import { STATUS_BAR_HEIGHT, StatusBar } from './status_bar.js';
import { AlienWave } from './alien_wave.js';

class Main extends GameObject {
    pressedKeys = new Set();

    onAssetLoaded = (asset) => {
        removeItem(this.loadingAssets, asset);
        if (this.loadingAssets.length == 0) {
            this.onAllAssetsLoaded();
        }
    };

    onKeyDown = (event) => {
        const shoot = this.settings.keyShoot();
        if (event.code == shoot && !this.pressedKeys.has(shoot)) {
            if (
                this.player.readyToShoot() &&
                this.playerBullets.length < this.maxNumBullets
            ) {
                let bullet = new Bullet(
                    this.player.rifleTip(),
                    this.assets.images.bullet
                );
                this.playerBullets.push(bullet);
                this.addChild(bullet);
                const sound = this.assets.sounds.playerLaser.htmlElement;
                sound.pause();
                sound.currentTime = 0;
                sound.play();
            }
        }
        this.pressedKeys.add(event.code);
        this.assets.music.battle.htmlElement.play();
    };

    onKeyUp = (event) => {
        this.pressedKeys.delete(event.code);
    };

    constructor(mainWindow, jsonParser, scriptElemId) {
        super(new Vector2(0, 0), 'Main');
        const scriptElem = mainWindow.document.getElementById(scriptElemId);
        this.window = mainWindow;
        this.server = new Server(
            Server.Type[scriptElem.getAttribute('serverType')]
        );
        this.rootPath = scriptElem.getAttribute('rootPath');
        this.jsonParser = jsonParser;
        this.canvas = this.window.document.getElementById(
            scriptElem.getAttribute('canvasId')
        );
        this.canvasRect = new Rectangle(
            new Vector2(0, 0),
            this.canvas.width,
            this.canvas.height - STATUS_BAR_HEIGHT
        );
        this.settings = new Settings();

        /** @type {Bullet[]} */
        this.playerBullets = [];

        this.maxNumBullets = 3;

        this.window.addEventListener('keydown', this.onKeyDown);
        this.window.addEventListener('keyup', this.onKeyUp);

        this.loadingAssets = [];
        this.assets = {
            images: {
                player: new ImageFile(
                    this.window.document,
                    this.rootPath + '/images/player.png',
                    this.onAssetLoaded
                ),
                bullet: new ImageFile(
                    this.window.document,
                    this.rootPath + '/images/bullet.png',
                    this.onAssetLoaded
                ),
                alien: new ImageFile(
                    this.window.document,
                    this.rootPath + '/images/alien.png',
                    this.onAssetLoaded
                ),
                alienBullet: new ImageFile(
                    this.window.document,
                    this.rootPath + '/images/alien_bullet.png',
                    this.onAssetLoaded
                ),
                explosion: new ImageFile(
                    this.window.document,
                    this.rootPath + '/images/explosion.png',
                    this.onAssetLoaded
                ),
                font: new ImageFile(
                    this.window.document,
                    this.rootPath + '/images/font.png',
                    this.onAssetLoaded
                ),
            },
            music: {
                battle: new AudioFile(
                    this.window.document,
                    this.rootPath + '/music/battle.ogg',
                    this.onAssetLoaded
                ),
            },
            sounds: {
                playerLaser: new AudioFile(
                    this.window.document,
                    this.rootPath + '/sounds/player_laser.wav',
                    this.onAssetLoaded
                ),
                playerExplosion: new AudioFile(
                    this.window.document,
                    this.rootPath + '/sounds/player_explosion.wav',
                    this.onAssetLoaded
                ),
                alienLaser: new AudioFile(
                    this.window.document,
                    this.rootPath + '/sounds/alien_laser.wav',
                    this.onAssetLoaded
                ),
                alienExplosion: new AudioFile(
                    this.window.document,
                    this.rootPath + '/sounds/alien_explosion.wav',
                    this.onAssetLoaded
                ),
            },
        };
        Object.values(this.assets).forEach((category) => {
            Object.values(category).forEach((asset) => {
                this.loadingAssets.push(asset);
            });
        });
        this.camera = new Camera(null, this.canvas.width, this.canvas.height);
        this.gameEngine = new GameEngine({
            rootGameObj: this,
            camera: this.camera,
            canvas: this.canvas,
            updatePeriodMs: 1000 / 60,
        });
        this.onAllAssetsLoaded = () => {
            this.addChild(this.camera);
            this.starsLayers = [
                new Stars(
                    0.5,
                    30 / 1000,
                    this.canvasRect,
                    200,
                    this.window.document
                ),
                new Stars(
                    0.3,
                    20 / 1000,
                    this.canvasRect,
                    200,
                    this.window.document
                ),
                new Stars(
                    0.2,
                    10 / 1000,
                    this.canvasRect,
                    200,
                    this.window.document
                ),
            ];
            for (const layer of this.starsLayers) {
                this.addChild(layer);
            }

            /** @type {Player} */
            this.player = new Player(
                this.canvasRect,
                this.assets.images.player,
                this.pressedKeys
            );
            this.addChild(this.player);

            this.alienWave = new AlienWave(
                this.canvasRect,
                this.assets.sounds.alienLaser,
                this.assets.sounds.alienExplosion,
                this.assets.images.alien,
                this.assets.images.explosion,
                this.assets.images.alienBullet
            );
            this.addChild(this.alienWave);
            this.font = new SpriteFont(
                this.assets.images.font,
                new Vector2(8, FONT_LINE_HEIGHT),
                -1,
                new Map([
                    [new Vector2(0, 0), Char.range('A', 'Z')],
                    [new Vector2(8, 1), Char.range('a', 'z')],
                    [new Vector2(0, 3), Char.range('0', '9')],
                    [new Vector2(16, 2), ['.', ',']],
                    [
                        new Vector2(10, 3),
                        [
                            '"',
                            '´',
                            '?',
                            '!',
                            '#',
                            '&',
                            '(',
                            ')',
                            '-',
                            '/',
                            ':',
                            ';',
                        ],
                    ],
                    [new Vector2(6, 4), ['Ä']],
                    [new Vector2(9, 4), ['Ö', 'Ü', 'ß']],
                    [new Vector2(15, 4), ['ä']],
                    [new Vector2(10, 5), ['ö']],
                    [new Vector2(14, 5), ['ü', ' ']],
                ])
            );
            this.score = 0;
            this.bonus = 0;
            this.statusBar = new StatusBar(
                this.canvasRect.bottomLeft(),
                this.canvasRect.width,
                this.font,
                this.score,
                this.bonus
            );
            this.addChild(this.statusBar);
            this.gameEngine.start();
        };
    }

    update(elapsedMs) {
        this.updateChildren(elapsedMs);

        /* handle interactions of all player bullets */
        for (let idx = this.playerBullets.length - 1; idx >= 0; idx--) {
            const bullet = this.playerBullets[idx];
            if (bullet.outOfSight()) {
                this.removeChild(bullet);
                this.playerBullets.splice(idx, 1);
                if (this.bonus > 0) {
                    this.bonus -= SCORE_BONUS_DECR_PER_MISS;
                    this.statusBar.updateScoreBonusStr(this.score, this.bonus);
                }
            } else {
                this.alienWave.forEachAlien((alien) => {
                    if (!alien.vulnerable()) {
                        return;
                    }
                    if (bullet.collider().intersectsWith(alien.collider())) {
                        alien.startExplosion(this.alienWave.removeAlien);
                        this.removeChild(bullet);
                        this.playerBullets.splice(idx, 1);
                        this.score += SCORE_PER_HIT + this.bonus;
                        this.bonus += SCORE_BONUS_INCR_PER_HIT;
                        this.statusBar.updateScoreBonusStr(
                            this.score,
                            this.bonus
                        );
                    }
                });
            }
        }
        /* handle interactions of all alien bullets */
        this.alienWave.forEachAlienBullet((bullet) => {
            if (bullet.outOfSight()) {
                this.alienWave.removeAlienBullet(bullet);
            } else {
                if (!this.player.vulnerable()) {
                    return;
                }
                if (bullet.collider().intersectsWith(this.player.collider())) {
                    this.player.respawn();
                    this.alienWave.removeAlienBullet(bullet);
                    this.bonus = Math.floor(
                        this.bonus / SCORE_BONUS_DIV_PER_DEATH
                    );
                    this.statusBar.updateScoreBonusStr(this.score, this.bonus);
                    const sound =
                        this.assets.sounds.playerExplosion.htmlElement;
                    sound.pause();
                    sound.currentTime = 0;
                    sound.play();
                }
            }
        });
        /* handle interactions of all aliens */
        this.alienWave.forEachAlien((alien) => {
            if (alien.finishedManeuver()) {
                this.alienWave.removeAlien(alien);
            } else {
                if (!this.player.vulnerable()) {
                    return;
                }
                if (alien.collider().intersectsWith(this.player.collider())) {
                    this.player.respawn();
                    this.bonus = Math.floor(
                        this.bonus / SCORE_BONUS_DIV_PER_DEATH
                    );
                    this.statusBar.updateScoreBonusStr(this.score, this.bonus);
                    const sound =
                        this.assets.sounds.playerExplosion.htmlElement;
                    sound.pause();
                    sound.currentTime = 0;
                    sound.play();
                }
            }
        });
    }

    draw(drawingContext) {
        this.drawChildren(drawingContext);
    }
}

new Main(window, JSON, 'mainScript');
