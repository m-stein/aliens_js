import { GameEngine } from 'jet/game_engine.js';
import { GameObject } from 'jet/game_object.js';
import { Vector2 } from 'jet/vector_2.js';
import { Rectangle } from 'jet/rectangle.js';
import { SpriteFont, SpriteFontSource } from 'jet/sprite_font.js';
import { charRange } from 'jet/char.js';
import { createEnum } from 'jet/enum.js';
import { AssetManager } from 'jet/asset_manager.js';
import { getHtmlAttr, getHtmlElem } from 'jet/html.js';
import { assertNotNull } from 'jet/assertions.js';
import { Camera } from 'jet/camera.js';

import { Server } from './server.js';
import { Player } from './player.js';
import { Stars } from './stars.js';
import { Settings } from './settings.js';
import { Bullet } from './bullet.js';
import {
    SCORE_BONUS_DECR_PER_MISS,
    SCORE_BONUS_DIV_PER_DEATH,
    SCORE_BONUS_INCR_PER_HIT,
    SCORE_PER_HIT,
} from './parameters.js';
import { STATUS_BAR_HEIGHT, StatusBar } from './status_bar.js';
import { MainMenu } from './main_menu.js';
import { GameOver } from './game_over.js';
import { Level1 } from './level_1.js';
import { Turret } from './turret.js';

const MAX_NUM_PLAYER_BULLETS = 3;

class Main extends GameObject {
    static State = createEnum({
        PressAnyButton: 0,
        MainMenu: 1,
        Level: 2,
        GameOver: 3,
    });

    /**
     * @param {KeyboardEvent} event
     */
    _handleLevelKeyDown(event) {
        switch (event.code) {
            case this._settings.fireKey():
                if (
                    this._player?.readyToShoot() &&
                    this._playerBullets.length < MAX_NUM_PLAYER_BULLETS
                ) {
                    let bullet = new Bullet(
                        this._player.rifleTip(),
                        this._assetMgr.imageAsset('bullet')
                    );
                    this._playerBullets.push(bullet);
                    this.addChild(bullet);
                    const sound =
                        this._assetMgr.audioAsset('player_laser').htmlElement;
                    sound.pause();
                    sound.currentTime = 0;
                    sound.play();
                }
                break;
            case this._settings.exitKey():
                this._goFromLevelToMainMenu();
                break;
        }
    }

    /**
     * @param {KeyboardEvent} event
     */
    _handlePressAnyButtonKeyDown(event) {
        switch (event.code) {
            case this._settings.fireKey():
                this._goFromPressAnyButtonToMainMenu();
                break;
        }
    }

    /**
     * @param {KeyboardEvent} event
     */
    _handleMainMenuKeyDown(event) {
        if (this._mainMenu?.acceptsInput()) {
            switch (event.code) {
                case this._settings.fireKey():
                    this._goFromMainMenuToLevel();
                    break;
            }
        }
    }

    /**
     * @param {KeyboardEvent} event
     */
    _handleGameOverKeyDown(event) {
        if (this._gameOver?.acceptsInput()) {
            switch (event.code) {
                case this._settings.fireKey():
                case this._settings.exitKey():
                    this._goFromGameOverToMainMenu();
                    break;
            }
        }
    }

    _tryStartMusic() {
        if (this._music) {
            if (this._music.paused) {
                this._music.play();
            }
        }
    }

    _tryStopMusic() {
        if (this._music) {
            this._music.pause();
            this._music.currentTime = 0;
        }
    }

    /**
     * @param {KeyboardEvent} event
     */
    _onKeyDown = (event) => {
        if (!this._pressedKeys.has(event.code)) {
            switch (this._state) {
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
        this._pressedKeys.add(event.code);
        this._tryStartMusic();
    };

    /**
     * @param {KeyboardEvent} event
     */
    _onKeyUp = (event) => {
        this._pressedKeys.delete(event.code);
    };

    /**
     *
     * @param {Window} window
     * @param {JSON} jsonParser
     * @param {string} scriptElemId
     */
    constructor(window, jsonParser, scriptElemId) {
        super(new Vector2(0, 0), 'Main');
        this._window = window;
        const scriptElem = getHtmlElem(
            window.document,
            scriptElemId,
            HTMLScriptElement
        );
        this._pressedKeys = new Set();
        /** @type {Bullet[]} */
        this._playerBullets = [];
        this._music = null;
        this._server = new Server(
            Server.Type.fromString(getHtmlAttr(scriptElem, 'serverType'))
        );
        this._rootPath = getHtmlAttr(scriptElem, 'rootPath');
        this._jsonParser = jsonParser;
        this._canvas = getHtmlElem(
            this._window.document,
            getHtmlAttr(scriptElem, 'canvasId'),
            HTMLCanvasElement
        );
        this._canvasRect = new Rectangle(
            new Vector2(0, 0),
            this._canvas.width,
            this._canvas.height - STATUS_BAR_HEIGHT
        );
        this._settings = new Settings();

        this._window.addEventListener('keydown', this._onKeyDown);
        this._window.addEventListener('keyup', this._onKeyUp);

        this._cam = new Camera(null, this._canvas.width, this._canvas.height);
        this._gameEngine = new GameEngine(
            this,
            this._cam,
            this._canvas,
            1000 / 60
        );
        this._onAssetsLoaded = () => {
            this.addChild(this._cam);
            this._starLayers = [
                new Stars(
                    0.5,
                    30 / 1000,
                    this._canvasRect,
                    200,
                    this._window.document
                ),
                new Stars(
                    0.3,
                    20 / 1000,
                    this._canvasRect,
                    200,
                    this._window.document
                ),
                new Stars(
                    0.2,
                    10 / 1000,
                    this._canvasRect,
                    200,
                    this._window.document
                ),
            ];
            for (const layer of this._starLayers) {
                this.addChild(layer);
            }
            const fontSrc = this._createFontSource();
            this._smallFont = new SpriteFont(fontSrc, 1);
            this._bigFont = new SpriteFont(fontSrc, 1, 2);
            this._enterPressAnyButton();
            this._switchToMusic(this._assetMgr.audioAsset('battle'));
            this._turret = new Turret(
                this._canvasRect,
                this._assetMgr.imageAsset('alien_bullet'),
                this._assetMgr.imageAsset('turret')
            );
            this.addChild(this._turret);
            this._gameEngine.start();
        };
        this._assetMgr = new AssetManager(
            this._window.document,
            this._rootPath
        );
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
        this._state = Main.State.PressAnyButton;
    }

    _enterMainMenu() {
        this._mainMenu = new MainMenu(
            new Rectangle(
                new Vector2(0, 0),
                this._canvas.width,
                this._canvas.height
            ),
            this._bigFont
        );
        this.addChild(this._mainMenu);
        this._state = Main.State.MainMenu;
    }

    _enterGameOver() {
        this._gameOver = new GameOver(
            new Rectangle(
                new Vector2(0, 0),
                this._canvas.width,
                this._canvas.height
            ),
            this._bigFont
        );
        this.addChild(this._gameOver);
        this._state = Main.State.GameOver;
    }

    /**
     * @param {import('jet/audio_file.js').AudioFile} audioFile
     */
    _switchToMusic(audioFile) {
        this._tryStopMusic();
        this._music = audioFile.htmlElement;
        this._tryStartMusic();
    }

    _enterLevel() {
        /** @type {Bullet[]} */
        this._playerBullets = [];
        this._player = new Player(
            this._canvasRect,
            this._assetMgr.imageAsset('player'),
            this._pressedKeys
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
        this._level = new Level1({
            dstRect: this._canvasRect,
            alienLaserSfx: this._assetMgr.audioAsset('alien_laser'),
            alienExplosionSfx: this._assetMgr.audioAsset('alien_explosion'),
            alienImg: this._assetMgr.imageAsset('alien'),
            explosionImg: this._assetMgr.imageAsset('explosion'),
            alienBulletImg: this._assetMgr.imageAsset('alien_bullet'),
            asteroidParams: asteroidParams,
            playerImg: this._assetMgr.imageAsset('player'),
            pressedKeys: this._pressedKeys,
        });
        this.addChild(this._level);
        this._score = 0;
        this._bonus = 0;
        this._statusBar = new StatusBar(
            this._canvasRect.bottomLeft(),
            this._canvasRect.width,
            this._smallFont,
            this._score,
            this._bonus,
            this._assetMgr.imageAsset('live')
        );
        this.addChild(this._statusBar);
        this._state = Main.State.Level;
    }

    _goFromPressAnyButtonToMainMenu() {
        this._enterMainMenu();
    }

    _goFromMainMenuToLevel() {
        assertNotNull(this._mainMenu);
        this.removeChild(this._mainMenu);
        this._mainMenu = null;
        this._enterLevel();
    }

    _removeCommonLevelObjects() {
        assertNotNull(this._statusBar);
        this.removeChild(this._statusBar);
        this._statusBar = null;
        this._bonus = null;
        this._score = null;
        assertNotNull(this._level);
        this.removeChild(this._level);
        this._level = null;
        for (const bullet of this._playerBullets) {
            this.removeChild(bullet);
        }
        this._playerBullets = [];
    }

    _goFromLevelToGameOver() {
        assertNotNull(this._player);
        this.removeChild(this._player);
        this._player = null;
        this._enterGameOver();
        this._switchToMusic(this._assetMgr.audioAsset('game_over'));
    }

    _goFromLevelToMainMenu() {
        this._removeCommonLevelObjects();
        assertNotNull(this._player);
        this.removeChild(this._player);
        this._player = null;
        this._enterMainMenu();
    }

    _goFromGameOverToMainMenu() {
        this._removeCommonLevelObjects();
        assertNotNull(this._gameOver);
        this.removeChild(this._gameOver);
        this._gameOver = null;
        this._enterMainMenu();
        this._switchToMusic(this._assetMgr.audioAsset('battle'));
    }

    _handleInteractionsOfPlayerBullets() {
        assertNotNull(this._statusBar);
        assertNotNull(this._score);
        assertNotNull(this._level);
        for (let idx = this._playerBullets.length - 1; idx >= 0; idx--) {
            const bullet = this._playerBullets[idx];
            if (bullet.outOfSight()) {
                this.removeChild(bullet);
                this._playerBullets.splice(idx, 1);
                if (this._bonus > 0) {
                    this._bonus -= SCORE_BONUS_DECR_PER_MISS;
                    this._statusBar.updateScoreBonusStr(
                        this._score,
                        this._bonus
                    );
                }
            } else {
                this._level.handlePlayerBulletInteractions(
                    bullet,
                    () => {
                        this._playerBullets.splice(idx, 1);
                        this.removeChild(bullet);
                    },
                    () => {
                        assertNotNull(this._statusBar);
                        assertNotNull(this._score);
                        this._score += SCORE_PER_HIT + this._bonus;
                        this._bonus += SCORE_BONUS_INCR_PER_HIT;
                        this._statusBar.updateScoreBonusStr(
                            this._score,
                            this._bonus
                        );
                    }
                );
            }
        }
    }

    _killPlayer = () => {
        assertNotNull(this._statusBar);
        assertNotNull(this._score);
        assertNotNull(this._player);
        const sound = this._assetMgr.audioAsset('player_explosion').htmlElement;
        sound.pause();
        sound.currentTime = 0;
        sound.play();
        this._bonus = Math.floor(this._bonus / SCORE_BONUS_DIV_PER_DEATH);
        this._statusBar.updateScoreBonusStr(this._score, this._bonus);
        this._statusBar.decrNumLives();
        this._player.respawn();
    };

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        this.updateChildren(elapsedMs);
        switch (this._state) {
            case Main.State.PressAnyButton:
            case Main.State.MainMenu:
                break;
            case Main.State.GameOver:
                assertNotNull(this._level);
                this._handleInteractionsOfPlayerBullets();
                this._level.handleAsteroidInteractions();
                this._level.handleAlienBulletInteractions();
                this._level.handleAlienShipInteractions();
                break;
            case Main.State.Level:
                assertNotNull(this._level);
                assertNotNull(this._player);
                assertNotNull(this._statusBar);
                this._handleInteractionsOfPlayerBullets();
                this._level.handleAsteroidInteractions(
                    this._player,
                    this._killPlayer
                );
                this._level.handleAlienBulletInteractions(
                    this._player,
                    this._killPlayer
                );
                this._level.handleAlienShipInteractions(
                    this._player,
                    this._killPlayer
                );
                if (this._statusBar.numLives() == 0) {
                    this._goFromLevelToGameOver();
                }
                break;
        }
    }

    /**
     * @param {import('jet/drawing_context.js').DrawingContext} drawingContext
     */
    draw(drawingContext) {
        this.drawChildren(drawingContext);
        if (this._state == Main.State.PressAnyButton) {
            this._smallFont.drawString(
                drawingContext,
                new Vector2(
                    3,
                    this._canvas.height - this._smallFont.lineHeight() - 5
                ),
                'Press any button'
            );
        }
    }
}

new Main(window, JSON, 'mainScript');
