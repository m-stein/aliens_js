import { GameEngine } from 'jet/game_engine.js';
import { GameObject } from 'jet/game_object.js';
import { Vector2 } from 'jet/vector_2.js';
import { Camera } from './camera.js';
import { Rectangle } from 'jet/rectangle.js';
import { Server } from './server.js';
import { Player } from './player.js';
import { Stars } from './stars.js';
import { Settings } from './settings.js';
import { Bullet } from './bullet.js';
import { SpriteFont, SpriteFontSource } from 'jet/sprite_font.js';
import { charRange } from 'jet/char.js';
import {
    SCORE_BONUS_DECR_PER_MISS,
    SCORE_BONUS_DIV_PER_DEATH,
    SCORE_BONUS_INCR_PER_HIT,
    SCORE_PER_HIT,
} from './parameters.js';
import { STATUS_BAR_HEIGHT, StatusBar } from './status_bar.js';
import { createEnum } from 'jet/enum.js';
import { MainMenu } from './main_menu.js';
import { GameOver } from './game_over.js';
import { Level1 } from './level_1.js';
import { Turret } from './turret.js';
import { AssetManager } from 'jet/asset_manager.js';

const MAX_NUM_PLAYER_BULLETS = 3;

class Main extends GameObject {
    static State = createEnum({
        PressAnyButton: 0,
        MainMenu: 1,
        Level: 2,
        GameOver: 3,
    });

    _handleLevelKeyDown(event) {
        switch (event.code) {
            case this.settings.fireKey():
                if (
                    this._player.readyToShoot() &&
                    this.playerBullets.length < MAX_NUM_PLAYER_BULLETS
                ) {
                    let bullet = new Bullet(
                        this._player.rifleTip(),
                        this._assetMgr.imageAsset('bullet')
                    );
                    this.playerBullets.push(bullet);
                    this.addChild(bullet);
                    const sound =
                        this._assetMgr.audioAsset('player_laser').htmlElement;
                    sound.pause();
                    sound.currentTime = 0;
                    sound.play();
                }
                break;
            case this.settings.exitKey():
                this._goFromLevelToMainMenu();
                break;
        }
    }

    _handlePressAnyButtonKeyDown(event) {
        switch (event.code) {
            case this.settings.fireKey():
                this._goFromPressAnyButtonToMainMenu();
                break;
        }
    }

    _handleMainMenuKeyDown(event) {
        if (this.mainMenu.acceptsInput()) {
            switch (event.code) {
                case this.settings.fireKey():
                    this._goFromMainMenuToLevel();
                    break;
            }
        }
    }

    _handleGameOverKeyDown(event) {
        if (this.gameOver.acceptsInput()) {
            switch (event.code) {
                case this.settings.fireKey():
                case this.settings.exitKey():
                    this._goFromGameOverToMainMenu();
                    break;
            }
        }
    }

    _tryStartMusic() {
        if (this.music) {
            if (this.music.paused) {
                this.music.play();
            }
        }
    }

    _tryStopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }

    _onKeyDown = (event) => {
        if (!this.pressedKeys.has(event.code)) {
            switch (this.state) {
                case Main.State.PressAnyButton:
                    this._handlePressAnyButtonKeyDown(event);
                    break;
                case Main.State.MainMenu:
                    this._handleMainMenuKeyDown(event);
                    break;
                case Main.State.Level:
                    this._handleLevelKeyDown(event);
                    break;
                case Main.State.GameOver:
                    this._handleGameOverKeyDown(event);
                    break;
            }
        }
        this.pressedKeys.add(event.code);
        this._tryStartMusic();
    };

    _onKeyUp = (event) => {
        this.pressedKeys.delete(event.code);
    };

    constructor(mainWindow, jsonParser, scriptElemId) {
        super(new Vector2(0, 0), 'Main');
        const scriptElem = mainWindow.document.getElementById(scriptElemId);
        this.pressedKeys = new Set();
        this.window = mainWindow;
        this.music = null;
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

        this.camera = new Camera(null, this.canvas.width, this.canvas.height);
        this.gameEngine = new GameEngine(
            this,
            this.camera,
            this.canvas,
            1000 / 60
        );
        this._onAssetsLoaded = () => {
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
            const fontSrc = this._createFontSource();
            this.smallFont = new SpriteFont(fontSrc, 1);
            this.bigFont = new SpriteFont(fontSrc, 1, 2);
            this._enterPressAnyButton();
            this._switchToMusic(this._assetMgr.audioAsset('battle'));
            this._turret = new Turret(
                this.canvasRect,
                this._assetMgr.imageAsset('alien_bullet'),
                this._assetMgr.imageAsset('turret')
            );
            this.addChild(this._turret);
            this.gameEngine.start();
        };
        this._assetMgr = new AssetManager(this.window.document, this.rootPath);
        this._assetMgr.addImageAssets([
            { id: 'player', path: '/images/player.png' },
            { id: 'turret', path: '/images/turret.png' },
            { id: 'bullet', path: '/images/bullet.png' },
            { id: 'alien', path: '/images/alien.png' },
            { id: 'alien_bullet', path: '/images/alien_bullet.png' },
            { id: 'explosion', path: '/images/explosion.png' },
            { id: 'asteroid_0', path: '/images/asteroid_0.png' },
            { id: 'asteroid_1', path: '/images/asteroid_1.png' },
            { id: 'asteroid_2', path: '/images/asteroid_2.png' },
            { id: 'asteroid_3', path: '/images/asteroid_3.png' },
            { id: 'asteroid_4', path: '/images/asteroid_4.png' },
            { id: 'asteroid_5', path: '/images/asteroid_5.png' },
            { id: 'live', path: '/images/live.png' },
            { id: 'font', path: '/images/font.png' },
        ]);
        this._assetMgr.addAudioAssets([
            { id: 'battle', path: '/music/battle.ogg' },
            { id: 'game_over', path: '/music/game_over.ogg' },
            { id: 'player_laser', path: '/sounds/player_laser.wav' },
            { id: 'player_explosion', path: '/sounds/player_explosion.wav' },
            { id: 'alien_laser', path: '/sounds/alien_laser.wav' },
            { id: 'alien_explosion', path: '/sounds/alien_explosion.wav' },
        ]);
        this._assetMgr.loadAssets(this._onAssetsLoaded);
    }

    /**
     * @returns {SpriteFontSource}
     */
    _createFontSource() {
        return new SpriteFontSource(
            this._assetMgr.imageAsset('font'),
            new Vector2(9, 9),
            new Map([
                [new Vector2(32, 0), charRange('A', 'Z')],
                [new Vector2(64, 0), charRange('a', 'z')],
                [new Vector2(15, 0), charRange('0', '9')],
                [new Vector2(25, 0), [':']],
                [new Vector2(0, 0), ['!']],
            ])
        );
    }

    _enterPressAnyButton() {
        this.state = Main.State.PressAnyButton;
    }

    _enterMainMenu() {
        this.mainMenu = new MainMenu(
            new Rectangle(
                new Vector2(0, 0),
                this.canvas.width,
                this.canvas.height
            ),
            this.bigFont
        );
        this.addChild(this.mainMenu);
        this.state = Main.State.MainMenu;
    }

    _enterGameOver() {
        this.gameOver = new GameOver(
            new Rectangle(
                new Vector2(0, 0),
                this.canvas.width,
                this.canvas.height
            ),
            this.bigFont
        );
        this.addChild(this.gameOver);
        this.state = Main.State.GameOver;
    }

    /**
     * @param {AudioFile} audioFile
     */
    _switchToMusic(audioFile) {
        this._tryStopMusic();
        this.music = audioFile.htmlElement;
        this._tryStartMusic();
    }

    _enterLevel() {
        /** @type {Bullet[]} */
        this.playerBullets = [];
        this._player = new Player(
            this.canvasRect,
            this._assetMgr.imageAsset('player'),
            this.pressedKeys
        );
        this.addChild(this._player);
        const asteroidParams = [
            {
                image: this._assetMgr.imageAsset('asteroid_0'),
                collider: new Rectangle(new Vector2(58, 60), 90, 72),
            },
            {
                image: this._assetMgr.imageAsset('asteroid_1'),
                collider: new Rectangle(new Vector2(52, 66), 96, 70),
            },
            {
                image: this._assetMgr.imageAsset('asteroid_2'),
                collider: new Rectangle(new Vector2(60, 82), 134, 88),
            },
            {
                image: this._assetMgr.imageAsset('asteroid_3'),
                collider: new Rectangle(new Vector2(72, 80), 106, 112),
            },
            {
                image: this._assetMgr.imageAsset('asteroid_4'),
                collider: new Rectangle(new Vector2(41, 62), 144, 100),
            },
            {
                image: this._assetMgr.imageAsset('asteroid_5'),
                collider: new Rectangle(new Vector2(42, 66), 142, 85),
            },
        ];
        this.level = new Level1({
            dstRect: this.canvasRect,
            alienLaserSfx: this._assetMgr.audioAsset('alien_laser'),
            alienExplosionSfx: this._assetMgr.audioAsset('alien_explosion'),
            alienImg: this._assetMgr.imageAsset('alien'),
            explosionImg: this._assetMgr.imageAsset('explosion'),
            alienBulletImg: this._assetMgr.imageAsset('alien_bullet'),
            asteroidParams: asteroidParams,
            playerImg: this._assetMgr.imageAsset('player'),
            pressedKeys: this.pressedKeys,
        });
        this.addChild(this.level);
        this.score = 0;
        this.bonus = 0;
        this.statusBar = new StatusBar(
            this.canvasRect.bottomLeft(),
            this.canvasRect.width,
            this.smallFont,
            this.score,
            this.bonus,
            this._assetMgr.imageAsset('live')
        );
        this.addChild(this.statusBar);
        this.state = Main.State.Level;
    }

    _goFromPressAnyButtonToMainMenu() {
        this._enterMainMenu();
    }

    _goFromMainMenuToLevel() {
        this.removeChild(this.mainMenu);
        this.mainMenu = null;
        this._enterLevel();
    }

    _removeCommonLevelObjects() {
        this.removeChild(this.statusBar);
        this.statusBar = null;
        this.bonus = null;
        this.score = null;
        this.removeChild(this.level);
        this.level = null;
        for (const bullet of this.playerBullets) {
            this.removeChild(bullet);
        }
        this.playerBullets = null;
    }

    _goFromLevelToGameOver() {
        this.removeChild(this._player);
        this._player = null;
        this._enterGameOver();
        this._switchToMusic(this._assetMgr.audioAsset('game_over'));
    }

    _goFromLevelToMainMenu() {
        this._removeCommonLevelObjects();
        this.removeChild(this._player);
        this._player = null;
        this._enterMainMenu();
    }

    _goFromGameOverToMainMenu() {
        this._removeCommonLevelObjects();
        this.removeChild(this.gameOver);
        this.gameOver = null;
        this._enterMainMenu();
        this._switchToMusic(this._assetMgr.audioAsset('battle'));
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
                this.level.handlePlayerBulletInteractions(
                    bullet,
                    () => {
                        this.playerBullets.splice(idx, 1);
                        this.removeChild(bullet);
                    },
                    () => {
                        this.score += SCORE_PER_HIT + this.bonus;
                        this.bonus += SCORE_BONUS_INCR_PER_HIT;
                        this.statusBar.updateScoreBonusStr(
                            this.score,
                            this.bonus
                        );
                    }
                );
            }
        }
    }

    _killPlayer = () => {
        const sound = this._assetMgr.audioAsset('player_explosion').htmlElement;
        sound.pause();
        sound.currentTime = 0;
        sound.play();
        this.bonus = Math.floor(this.bonus / SCORE_BONUS_DIV_PER_DEATH);
        this.statusBar.updateScoreBonusStr(this.score, this.bonus);
        this.statusBar.decrNumLives();
        this._player.respawn();
    };

    update(elapsedMs) {
        this.updateChildren(elapsedMs);
        switch (this.state) {
            case Main.State.PressAnyButton:
            case Main.State.MainMenu:
                break;
            case Main.State.GameOver:
                this._handleInteractionsOfPlayerBullets();
                this.level.handleAsteroidInteractions();
                this.level.handleAlienBulletInteractions();
                this.level.handleAlienShipInteractions();
                break;
            case Main.State.Level:
                this._handleInteractionsOfPlayerBullets();
                this.level.handleAsteroidInteractions(
                    this._player,
                    this._killPlayer
                );
                this.level.handleAlienBulletInteractions(
                    this._player,
                    this._killPlayer
                );
                this.level.handleAlienShipInteractions(
                    this._player,
                    this._killPlayer
                );
                if (this.statusBar.numLives() == 0) {
                    this._goFromLevelToGameOver();
                }
                break;
        }
    }

    draw(drawingContext) {
        this.drawChildren(drawingContext);
        if (this.state == Main.State.PressAnyButton) {
            this.smallFont.drawString(
                drawingContext,
                new Vector2(
                    3,
                    this.canvas.height - this.smallFont.lineHeight() - 5
                ),
                'Press any button'
            );
        }
    }
}

new Main(window, JSON, 'mainScript');
