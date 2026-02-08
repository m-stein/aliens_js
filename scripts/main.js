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
import { Alien } from './alien.js';
import { Timeout } from './timeout.js';
import { SpriteFont } from './sprite_font.js';
import { Char } from './char.js';

const FONT_LINE_HEIGHT = 11;
const SCORE_BOARD_PADDING = new Vector2(4, 2);
const SCORE_BOARD_BORDER_SIZE = 1;
const SCORE_BOARD_HEIGHT = FONT_LINE_HEIGHT + 2 * SCORE_BOARD_BORDER_SIZE + 2 * SCORE_BOARD_PADDING.y;
const SCORE_BOARD_BORDER_COLOR = 'rgba(184, 184, 73)';
const SCORE_BOARD_FILL_COLOR = 'rgb(0,0,0)';

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
        let textVariable = 5;
        console.log(`${textVariable}`);
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
            this.canvas.height - SCORE_BOARD_HEIGHT
        );
        this.settings = new Settings();

        /** @type {Bullet[]} */
        this.playerBullets = [];

        this.alienBullets = [];
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

            /** @type {Alien[]} */
            this.aliens = [];
            this.alienSpawnTimeout = new Timeout(
                this._newAlienSpawnTimeoutMs(),
                this._spawnAlien
            );
            this.addChild(this.alienSpawnTimeout);
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
            this.scoreBoardBorderRect = new Rectangle(
                new Vector2(0, this.canvasRect.height),
                this.canvasRect.width,
                SCORE_BOARD_HEIGHT
            );
            this.scoreBoardFillRect = new Rectangle(
                new Vector2(
                    SCORE_BOARD_BORDER_SIZE,
                    this.canvasRect.height + SCORE_BOARD_BORDER_SIZE
                ),
                this.canvasRect.width - 2 * SCORE_BOARD_BORDER_SIZE,
                SCORE_BOARD_HEIGHT - 2 * SCORE_BOARD_BORDER_SIZE
            );
            this.score = 0;
            this.bonus = 0;
            this.scoreBoardStr = this._getScoreBoardStr();
            this.scoreBoardStrPos =
                this.scoreBoardFillRect.position
                    .copy()
                    .add(SCORE_BOARD_PADDING);
            this.gameEngine.start();
        };
    }

    /**
     * @returns {string}
     */
    _getScoreBoardStr() {
        return `Score: ${String(this.score).padEnd(8, ' ')}  Bonus: ${this.bonus}`
    }

    _spawnAlien = () => {
        const alien = new Alien(
            this.canvasRect,
            (bullet) => {
                this.alienBullets.push(bullet);
                this.addChild(bullet);
            },
            this.assets.sounds.alienLaser,
            this.assets.sounds.alienExplosion,
            this.assets.images.alien,
            this.assets.images.explosion,
            this.assets.images.alienBullet
        );
        this.aliens.push(alien);
        this.addChild(alien);
        this.alienSpawnTimeout.set(this._newAlienSpawnTimeoutMs());
    };

    /**
     * @returns {number}
     */
    _newAlienSpawnTimeoutMs() {
        return 500 + Math.random() * (1500 - 500);
    }

    /**
     * @param {Alien} alien
     * @param {number} idx
     */
    _removeAlien = (alien, idx = -1) => {
        if (idx !== -1) {
            idx = this.aliens.indexOf(alien);
        }
        if (idx !== -1) {
            this.aliens.splice(idx, 1);
        }
        this.removeChild(alien);
    };

    update(elapsedMs) {
        this.updateChildren(elapsedMs);

        /* handle interactions of all player bullets */
        for (let idx = this.playerBullets.length - 1; idx >= 0; idx--) {
            const bullet = this.playerBullets[idx];
            if (bullet.outOfSight()) {
                this.removeChild(bullet);
                this.playerBullets.splice(idx, 1);
                if (this.bonus > 0) {
                    this.bonus -= 1
                    this.scoreBoardStr = this._getScoreBoardStr();
                }
            } else {
                for (const alien of this.aliens) {
                    if (!alien.vulnerable()) {
                        continue;
                    }
                    if (bullet.collider().intersectsWith(alien.collider())) {
                        alien.startExplosion(this._removeAlien);
                        this.removeChild(bullet);
                        this.playerBullets.splice(idx, 1);
                        this.score += (5 + this.bonus);
                        this.bonus += 2;
                        this.scoreBoardStr = this._getScoreBoardStr();
                    }
                }
            }
        }
        /* handle interactions of all alien bullets */
        for (let idx = this.alienBullets.length - 1; idx >= 0; idx--) {
            const bullet = this.alienBullets[idx];
            if (bullet.outOfSight()) {
                this.removeChild(bullet);
                this.alienBullets.splice(idx, 1);
            } else {
                if (!this.player.vulnerable()) {
                    continue;
                }
                if (bullet.collider().intersectsWith(this.player.collider())) {
                    this.player.respawn();
                    this.bonus = 0;
                    this.scoreBoardStr = this._getScoreBoardStr();
                    this.removeChild(bullet);
                    this.alienBullets.splice(idx, 1);
                    const sound =
                        this.assets.sounds.playerExplosion.htmlElement;
                    sound.pause();
                    sound.currentTime = 0;
                    sound.play();
                }
            }
        }
        /* handle interactions of all aliens */
        for (let idx = this.aliens.length - 1; idx >= 0; idx--) {
            const alien = this.aliens[idx];
            if (alien.finishedManeuver()) {
                this._removeAlien(alien, idx);
            } else {
                if (!this.player.vulnerable()) {
                    continue;
                }
                if (alien.collider().intersectsWith(this.player.collider())) {
                    this.player.respawn();
                    this.bonus = 0;
                    this.scoreBoardStr = this._getScoreBoardStr();
                    const sound =
                        this.assets.sounds.playerExplosion.htmlElement;
                    sound.pause();
                    sound.currentTime = 0;
                    sound.play();
                }
            }
        }
    }

    draw(drawingContext) {
        this.drawChildren(drawingContext);

        /* draw score board */
        drawingContext.drawRect(this.scoreBoardBorderRect, SCORE_BOARD_BORDER_COLOR);
        drawingContext.drawRect(this.scoreBoardFillRect, SCORE_BOARD_FILL_COLOR);

        /* draw player score inside the score board */
        this.font.drawString(
            drawingContext,
            this.scoreBoardStrPos,
            this.scoreBoardStr
        );
    }
}

new Main(window, JSON, 'mainScript');
