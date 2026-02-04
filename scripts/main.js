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

class Main extends GameObject
{
    pressedKeys = new Set();

    onMouseMove = (event) => { this.updateRawMousePosition(event); }

    updateRawMousePosition(event)
    {
        this.rawMouseX = event.clientX;
        this.rawMouseY = event.clientY;
        this.mousePositionOutdated = true;
    }

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

    onMouseDown = (event) =>
    {
        if (this.loadingAssets.length > 0)
        {
            return;
        }
        this.updateRawMousePosition(event);
        this.mouseDownHandlers.forEach((handler) => { handler(); });
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
        this.bullets = [];
        this.max_num_bullets = 3;

        /* Initialize mouse position tracking */
        this.mouseDown = false;
        this.mousePosition = new Vector2(-1, -1);
        this.mousePositionOutdated = false;
        this.canvas.addEventListener("mousemove", this.onMouseMove);

        /* Initialize handling of mouse clicks */
        this.mouseDownHandlers = [];
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.window.addEventListener('keydown', this.onKeyDown);
        this.window.addEventListener('keyup', this.onKeyUp);

        /* Start loading common assets */
        this.loadingAssets = [];
        this.assets = {
            images: {
                player: new ImageFile(this.window.document, this.rootPath + "/images/player.png", this.onAssetLoaded),
                bullet: new ImageFile(this.window.document, this.rootPath + "/images/bullet.png", this.onAssetLoaded),
            },
            music: {
                battle: new AudioFile(this.window.document, this.rootPath + "/music/battle.ogg", this.onAssetLoaded)
            },
            sounds: {
                player_laser: new AudioFile(this.window.document, this.rootPath + "/sounds/player_laser.wav", this.onAssetLoaded)
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
            this.gameEngine.start();
        }
    }

    loadLevel(levelConfig)
    {
        this.addChild(this.camera);
    }

    update(deltaTimeMs)
    {
        /* Update mouse position if necessary */
        if (this.mousePositionOutdated) {
            const canvasRect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = (this.rawMouseX - canvasRect.left) * (this.canvas.width / canvasRect.width);
            this.mousePosition.y = (this.rawMouseY - canvasRect.top) * (this.canvas.height / canvasRect.height);
            this.mousePositionOutdated = false;
        }
        this.updateChildren(deltaTimeMs);
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            if (this.bullets[i].outOfSight()) {
                this.removeChild(this.bullets[i]);
                this.bullets.splice(i, 1);
            }
        }
    }

    draw(drawingContext)
    {
        this.drawChildren(drawingContext);
    }
}

const main = new Main(window, JSON, 'mainScript');
