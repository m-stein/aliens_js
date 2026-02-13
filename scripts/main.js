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
import { createEnum } from './enum.js';
import { MainMenu } from './main_menu.js';

const MAX_NUM_PLAYER_BULLETS = 3;

class Main extends GameObject {
    static State = createEnum({
        MainMenu: 0,
        Level: 1,
    });

    _onAssetLoaded = (asset) => {
        removeItem(this.loadingAssets, asset);
        if (this.loadingAssets.length == 0) {
            this.onAllAssetsLoaded();
        }
    };

    _handleLevelKeyDown(event) {
        switch (event.code) {
            case this.settings.fireKey():
                if (
                    this.player.readyToShoot() &&
                    this.playerBullets.length < MAX_NUM_PLAYER_BULLETS
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
                return;
            case this.settings.exitKey():
                this._leaveLevel();
                this._enterMainMenu();
                return;
        }
    }

    _handleMainMenuKeyDown(event) {
        switch (event.code) {
            case this.settings.fireKey():
                this._leaveMainMenu();
                this._enterLevel();
                return;
        }
    }

    _onKeyDown = (event) => {
        if (!this.pressedKeys.has(event.code)) {
            switch (this.state) {
                case Main.State.MainMenu:
                    this._handleMainMenuKeyDown(event);
                    break;
                case Main.State.Level:
                    this._handleLevelKeyDown(event);
                    break;
            }
        }
        this.pressedKeys.add(event.code);

        /* start playing background music if not playing yet */
        const music = this.assets.music.battle.htmlElement;
        if (music.paused) {
            music.play();
        }
    };

    _onKeyUp = (event) => {
        this.pressedKeys.delete(event.code);
    };

    constructor(mainWindow, jsonParser, scriptElemId) {
        super(new Vector2(0, 0), 'Main');
        const scriptElem = mainWindow.document.getElementById(scriptElemId);
        this.pressedKeys = new Set();
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

        this.window.addEventListener('keydown', this._onKeyDown);
        this.window.addEventListener('keyup', this._onKeyUp);

        this.loadingAssets = [];
        this.assets = {
            images: {
                player: new ImageFile(
                    this.window.document,
                    this.rootPath + '/images/player.png',
                    this._onAssetLoaded
                ),
                bullet: new ImageFile(
                    this.window.document,
                    this.rootPath + '/images/bullet.png',
                    this._onAssetLoaded
                ),
                alien: new ImageFile(
                    this.window.document,
                    this.rootPath + '/images/alien.png',
                    this._onAssetLoaded
                ),
                alienBullet: new ImageFile(
                    this.window.document,
                    this.rootPath + '/images/alien_bullet.png',
                    this._onAssetLoaded
                ),
                explosion: new ImageFile(
                    this.window.document,
                    this.rootPath + '/images/explosion.png',
                    this._onAssetLoaded
                ),
                live: new ImageFile(
                    this.window.document,
                    this.rootPath + '/images/live.png',
                    this._onAssetLoaded
                ),
                font: new ImageFile(
                    this.window.document,
                    this.rootPath + '/images/font.png',
                    this._onAssetLoaded
                ),
            },
            music: {
                battle: new AudioFile(
                    this.window.document,
                    this.rootPath + '/music/battle.ogg',
                    this._onAssetLoaded
                ),
            },
            sounds: {
                playerLaser: new AudioFile(
                    this.window.document,
                    this.rootPath + '/sounds/player_laser.wav',
                    this._onAssetLoaded
                ),
                playerExplosion: new AudioFile(
                    this.window.document,
                    this.rootPath + '/sounds/player_explosion.wav',
                    this._onAssetLoaded
                ),
                alienLaser: new AudioFile(
                    this.window.document,
                    this.rootPath + '/sounds/alien_laser.wav',
                    this._onAssetLoaded
                ),
                alienExplosion: new AudioFile(
                    this.window.document,
                    this.rootPath + '/sounds/alien_explosion.wav',
                    this._onAssetLoaded
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
            this._enterMainMenu();
            this.gameEngine.start();
        };
    }

    _enterMainMenu() {
        this.mainMenu = new MainMenu(
            new Rectangle(
                new Vector2(0, 0),
                this.canvas.width,
                this.canvas.height
            ),
            this.font
        );
        this.addChild(this.mainMenu);
        this.state = Main.State.MainMenu;
    }

    _leaveMainMenu() {
        this.removeChild(this.mainMenu);
        this.mainMenu = null;
    }

    _enterLevel() {
        /** @type {Bullet[]} */
        this.playerBullets = [];
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

        this.score = 0;
        this.bonus = 0;
        this.statusBar = new StatusBar(
            this.canvasRect.bottomLeft(),
            this.canvasRect.width,
            this.font,
            this.score,
            this.bonus,
            this.assets.images.live
        );
        this.addChild(this.statusBar);
        this.state = Main.State.Level;
    }

    _leaveLevel() {
        this.removeChild(this.statusBar);
        this.statusBar = null;
        this.bonus = null;
        this.score = null;
        this.removeChild(this.alienWave);
        this.alienWave = null;
        this.removeChild(this.player);
        this.player = null;
        this.playerBullets = null;
    }

    _handleInteractionsOfPlayerBullets() {
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
    }

    _handleInteractionsOfAlienBullets() {
        this.alienWave.forEachAlienBullet((bullet) => {
            if (bullet.outOfSight()) {
                this.alienWave.removeAlienBullet(bullet);
            } else {
                if (!this.player.vulnerable()) {
                    return;
                }
                if (bullet.collider().intersectsWith(this.player.collider())) {
                    this.alienWave.removeAlienBullet(bullet);
                    this._killPlayer();
                }
            }
        });
    }

    _handleInteractionsOfAlienShips() {
        this.alienWave.forEachAlien((alien) => {
            if (alien.finishedManeuver()) {
                this.alienWave.removeAlien(alien);
            } else {
                if (!this.player.vulnerable()) {
                    return;
                }
                if (alien.collider().intersectsWith(this.player.collider())) {
                    this._killPlayer();
                }
            }
        });
    }

    _killPlayer() {
        const sound = this.assets.sounds.playerExplosion.htmlElement;
        sound.pause();
        sound.currentTime = 0;
        sound.play();
        this.bonus = Math.floor(this.bonus / SCORE_BONUS_DIV_PER_DEATH);
        this.statusBar.updateScoreBonusStr(this.score, this.bonus);
        this.statusBar.decrNumLives();
        this.player.respawn();
    }

    update(elapsedMs) {
        this.updateChildren(elapsedMs);
        switch (this.state) {
            case Main.State.MainMenu:
                break;
            case Main.State.Level:
                this._handleInteractionsOfPlayerBullets();
                this._handleInteractionsOfAlienBullets();
                this._handleInteractionsOfAlienShips();
                if (this.statusBar.numLives() == 0) {
                    this._leaveLevel();
                    this._enterMainMenu();
                }
                break;
        }
    }

    draw(drawingContext) {
        this.drawChildren(drawingContext);
    }
}

new Main(window, JSON, 'mainScript');
