import { GameEngine } from './game_engine.js';
import { GameObject } from './game_object.js';
import { Vector2 } from './vector_2.js';
import { Camera } from './camera.js';
import { Rectangle } from './rectangle.js';
import { ImageFile } from './image_file.js';
import { removeItem } from './array_utilities.js';
import { Server } from './server.js';

class Main extends GameObject
{
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
        if (this.loadingAssets.length)
        {
            return;
        }
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

        /* Initialize mouse position tracking */
        this.mouseDown = false;
        this.mousePosition = new Vector2(-1, -1);
        this.mousePositionOutdated = false;
        this.canvas.addEventListener("mousemove", this.onMouseMove);

        /* Initialize handling of mouse clicks */
        this.mouseDownHandlers = [];
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.window.addEventListener('keydown', this.onKeyDown);

        /* Start loading common assets */
        this.loadingAssets = [];
        this.backgroundMusicFiles = [];
        this.images = {
            sky: new ImageFile(this.window.document, this.rootPath + "/images/sky.png", this.onAssetLoaded),
        };
        this.loadingAssets.push(...this.backgroundMusicFiles);
        Object.values(this.images).forEach((image) => { this.loadingAssets.push(image); });
        this.camera = new Camera(this.images.sky, this.canvas.width, this.canvas.height);
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
    }

    draw(drawingContext)
    {
        this.drawChildren(drawingContext);
    }
}

const main = new Main(window, JSON, 'mainScript');
