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

class Main extends GameObject
{
    pressedKeys = new Set();

    onAssetLoaded = (asset) =>
    {
        removeItem(this.loadingAssets, asset);
        if (this.loadingAssets.length == 0) {
            this.onAllAssetsLoaded();
        }
    }

    onKeyDown = (event) =>
    {
        const shoot = this.settings.keyShoot();
        if (event.code == shoot && !this.pressedKeys.has(shoot)) {
            if (this.player.ready_to_shoot() && this.bullets.length < this.max_num_bullets) {
                let bullet = new Bullet(this.player.rifle_tip(), this.assets.images.bullet);
                this.bullets.push(bullet);
                this.addChild(bullet);
                const sound = this.assets.sounds.player_laser.htmlElement;
                sound.pause();
                sound.currentTime = 0;
                sound.play();
            }
        }
        this.pressedKeys.add(event.code)
        this.assets.music.battle.htmlElement.play();
    }

    onKeyUp = (event) =>
    {
        this.pressedKeys.delete(event.code)
    }

    constructor(mainWindow, jsonParser, scriptElemId)
    {
        super(new Vector2(0, 0), 'Main');
        const scriptElem = mainWindow.document.getElementById(scriptElemId);
        this.window = mainWindow;
        this.server = new Server(Server.Type[scriptElem.getAttribute('serverType')]);
        this.rootPath = scriptElem.getAttribute('rootPath');
        this.jsonParser = jsonParser;
        this.canvas = this.window.document.getElementById(scriptElem.getAttribute('canvasId'));
        this.canvasRect = new Rectangle(new Vector2(0, 0), this.canvas.width, this.canvas.height);
        this.settings = new Settings();

        /** @type {Bullet[]} */
        this.bullets = [];

        this.alienBullets = [];
        this.max_num_bullets = 3;

        this.window.addEventListener('keydown', this.onKeyDown);
        this.window.addEventListener('keyup', this.onKeyUp);

        this.loadingAssets = [];
        this.assets = {
            images: {
                player: new ImageFile(this.window.document, this.rootPath + "/images/player.png", this.onAssetLoaded),
                bullet: new ImageFile(this.window.document, this.rootPath + "/images/bullet.png", this.onAssetLoaded),
                alien: new ImageFile(this.window.document, this.rootPath + "/images/alien.png", this.onAssetLoaded),
                alienBullet: new ImageFile(this.window.document, this.rootPath + "/images/alien_bullet.png", this.onAssetLoaded),
                explosion: new ImageFile(this.window.document, this.rootPath + "/images/explosion.png", this.onAssetLoaded),
            },
            music: {
                battle: new AudioFile(this.window.document, this.rootPath + "/music/battle.ogg", this.onAssetLoaded)
            },
            sounds: {
                player_laser: new AudioFile(this.window.document, this.rootPath + "/sounds/player_laser.wav", this.onAssetLoaded),
                alien_laser: new AudioFile(this.window.document, this.rootPath + "/sounds/alien_laser.wav", this.onAssetLoaded),
                alien_explosion: new AudioFile(this.window.document, this.rootPath + "/sounds/alien_explosion.wav", this.onAssetLoaded),
            }
        }
        Object.values(this.assets).forEach((category) => {
            Object.values(category).forEach((asset) => { this.loadingAssets.push(asset); });
        });
        this.camera = new Camera(null, this.canvas.width, this.canvas.height);
        this.gameEngine = new GameEngine
        ({
            rootGameObj: this,
            camera: this.camera,
            canvas: this.canvas,
            updatePeriodMs: 1000 / 60,
        });
        this.onAllAssetsLoaded = () =>
        {
            this.addChild(this.camera);
            this.starsLayers = [
                new Stars(0.5, 30 / 1000, this.canvasRect, 200, this.window.document),
                new Stars(0.3, 20 / 1000, this.canvasRect, 200, this.window.document),
                new Stars(0.2, 10 / 1000, this.canvasRect, 200, this.window.document),
            ];
            for (const layer of this.starsLayers) {
                this.addChild(layer);
            }
            this.player = new Player(this.canvasRect, this.assets.images.player, this.pressedKeys);
            this.addChild(this.player);

            /** @type {Alien[]} */
            this.aliens = [];
            this.aliens.push(new Alien(
                this.canvasRect,
                (bullet) => {
                    this.alienBullets.push(bullet);
                    this.addChild(bullet);
                },
                this.assets.sounds.alien_laser,
                this.assets.sounds.alien_explosion,
                this.assets.images.alien,
                this.assets.images.explosion,
                this.assets.images.alienBullet
            ));
            for (const alien of this.aliens) {
                this.addChild(alien);
            }
            this.gameEngine.start();
        }
    }

    loadLevel(levelConfig)
    {
        this.addChild(this.camera);
    }

    update(deltaTimeMs)
    {
        this.updateChildren(deltaTimeMs);

        /* handle interactions of all player bullets */
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            if (this.bullets[i].outOfSight()) {
                this.removeChild(this.bullets[i]);
                this.bullets.splice(i, 1);
            } else {
                for (const alien of this.aliens) {
                    if (!alien.vulnerable()) {
                        continue;
                    }
                    if (this.bullets[i].collider().intersectsWith(alien.collider())) {
                        alien.startExplosion(() => {
                            this.removeChild(alien);
                            const idx = this.aliens.findIndex(item => item === alien);
                            if (idx !== -1) {
                                this.aliens.splice(idx, 1);
                            }
                        });
                    }
                }
            }
        }
        /* handle interactions of all alien bullets */
        for (let i = this.alienBullets.length - 1; i >= 0; i--) {
            const bullet = this.alienBullets[i];
            if (bullet.outOfSight()) {
                this.removeChild(bullet);
                this.alienBullets.splice(i, 1);
            }
        }
        /* handle interactions of all aliens */
        for (let i = this.aliens.length - 1; i >= 0; i--) {
            const alien = this.aliens[i];
            if (alien.finishedManeuver()) {
                this.removeChild(alien);
                this.aliens.splice(i, 1);
            }
        }
    }

    draw(drawingContext)
    {
        this.drawChildren(drawingContext);
    }
}

const main = new Main(window, JSON, 'mainScript');
