declare module 'jet/vector_2.js' {
    export class Vector2 {
        /**
         * @param {number} x
         * @param {number} y
         */
        constructor(x: number, y: number);
        x: number;
        y: number;
        /**
         * @param {Vector2} other
         * @returns {number}
         */
        distanceTo(other: Vector2): number;
        /**
         * @returns {Vector2}
         */
        copy(): Vector2;
        /**
         * @param {Vector2} other
         * @returns {boolean}
         */
        equals(other: Vector2): boolean;
        /**
         * @param {Vector2} other
         * @returns {Vector2}
         */
        add(other: Vector2): Vector2;
        /**
         * @param {number} factor
         * @returns {Vector2}
         */
        scale(factor: number): Vector2;
        /**
         * @param {Vector2} other
         * @returns {Vector2}
         */
        subtract(other: Vector2): Vector2;
        /**
         * @returns {number}
         */
        length(): number;
        /**
         * @returns {Vector2}
         */
        normalized(): Vector2;
        /**
         * @returns {string}
         */
        toString(): string;
    }
}
declare module 'jet/math.js' {
    /**
     * @param {number} src
     * @param {number} dst
     * @param {number} amount
     * @returns {number}
     */
    export function lerp(src: number, dst: number, amount: number): number;
    /**
     * @param {Vector2} src
     * @param {Vector2} dst
     * @param {number} factor
     * @returns {Vector2}
     */
    export function lerpVec2(
        src: Vector2,
        dst: Vector2,
        factor: number
    ): Vector2;
    /**
     * @param {Vector2} vec
     * @returns {Vector2}
     */
    export function floorVec2(vec: Vector2): Vector2;
    /**
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    export function clamp(value: number, min: number, max: number): number;
    /**
     * @param {number} minInclusive
     * @param {number} maxExclusive
     * @returns {number}
     */
    export function randomInt(
        minInclusive: number,
        maxExclusive: number
    ): number;
    /**
     * @param {Vector2} coord
     * @param {number} matrixSize
     * @param {number} numRotations
     * @returns {Vector2}
     */
    export function rotateQuadrMatrix2CoordClockwise(
        coord: Vector2,
        matrixSize: number,
        numRotations: number
    ): Vector2;
    /**
     * @param {number} degrees
     * @returns {Vector2}
     */
    export function angleToUnitVector(degrees: number): Vector2;
    import { Vector2 } from 'jet/vector_2.js';
}
declare module 'jet/array.js' {
    /**
     * @template T
     * @param {T[]} array
     * @param {T} item
     */
    export function removeItem<T>(array: T[], item: T): void;
    /**
     * @template T
     * @param {T[]} array
     * @returns {T}
     */
    export function getRandomItem<T>(array: T[]): T;
    /**
     * @template T
     * @param {T[]} array
     * @returns {T[]}
     */
    export function cloneArray<T>(array: T[]): T[];
    /**
     * @template T
     * @param {T[]} availableItems
     * @param {number} numItems
     * @returns {T[]}
     */
    export function makeRandomSelection<T>(
        availableItems: T[],
        numItems: number
    ): T[];
    /**
     * @template T
     * @param {T[]} array
     * @returns {T}
     */
    export function lastItem<T>(array: T[]): T;
}
declare module 'jet/audio_file.js' {
    export class AudioFile {
        /**
         * @param {Document} htmlDocument
         * @param {string} relPath
         * @param {(a: AudioFile) => void} onLoaded
         */
        constructor(
            htmlDocument: Document,
            relPath: string,
            onLoaded: (a: AudioFile) => void
        );
        relPath: string;
        onLoaded: (a: AudioFile) => void;
        htmlElement: HTMLAudioElement;
        onCanPlayThrough: () => void;
    }
}
declare module 'jet/image_file.js' {
    export class ImageFile {
        /**
         * @param {Document} htmlDocument
         * @param {string} relPath
         * @param {(a: ImageFile) => void} onLoaded
         */
        constructor(
            htmlDocument: Document,
            relPath: string,
            onLoaded: (a: ImageFile) => void
        );
        relPath: string;
        onLoaded: (a: ImageFile) => void;
        htmlElement: HTMLImageElement;
    }
}
declare module 'jet/asset_manager.js' {
    export class AssetManager {
        /**
         * @param {HTMLDocument} document
         * @param {string} rootPath
         */
        constructor(document: HTMLDocument, rootPath: string);
        _rootPath: string;
        _document: HTMLDocument;
        /** @type {{path: string, id: string, obj: AudioFile | null}[]} */
        _pendingAudioAssets: {
            path: string;
            id: string;
            obj: AudioFile | null;
        }[];
        /** @type {{path: string, id: string, obj: ImageFile | null}[]} */
        _pendingImgAssets: {
            path: string;
            id: string;
            obj: ImageFile | null;
        }[];
        /** @type {Object<string, AudioFile>} */
        _audioAssets: {
            [x: string]: AudioFile;
        };
        /** @type {Object<string, ImageFile>} */
        _imgAssets: {
            [x: string]: ImageFile;
        };
        /**
         * @param {(() => void)} finishedFn
         */
        loadAssets(finishedFn: () => void): void;
        _loadingFinishedFn: (() => void) | undefined;
        /**
         * @param {{path: string, id: string, obj: AudioFile | ImageFile | null}[]} pendingAssets
         * @param {{path: string, id: string}[]} assets
         */
        _addAssets(
            pendingAssets: {
                path: string;
                id: string;
                obj: AudioFile | ImageFile | null;
            }[],
            assets: {
                path: string;
                id: string;
            }[]
        ): void;
        /**
         * @param {{path: string, id: string}[]} assets
         */
        addAudioAssets(
            assets: {
                path: string;
                id: string;
            }[]
        ): void;
        /**
         * @param {{path: string, id: string}[]} assets
         */
        addImageAssets(
            assets: {
                path: string;
                id: string;
            }[]
        ): void;
        /**
         * @param {ImageFile | AudioFile} assetObj
         * @param {{path: string, id: string, obj: AudioFile | ImageFile | null}[]} pendingAssets
         * @param {Object<string, AudioFile | ImageFile>} loadedAssets
         */
        _markAssetLoaded(
            assetObj: ImageFile | AudioFile,
            pendingAssets: {
                path: string;
                id: string;
                obj: AudioFile | ImageFile | null;
            }[],
            loadedAssets: {
                [x: string]: AudioFile | ImageFile;
            }
        ): void;
        /**
         * @param {ImageFile | AudioFile} assetObj
         */
        _onAssetLoaded: (assetObj: ImageFile | AudioFile) => void;
        /**
         * @param {string} path
         * @returns {AudioFile}
         */
        audioAsset(path: string): AudioFile;
        /**
         * @param {string} path
         * @returns {ImageFile}
         */
        imageAsset(path: string): ImageFile;
    }
    import { AudioFile } from 'jet/audio_file.js';
    import { ImageFile } from 'jet/image_file.js';
}
declare module 'jet/char.js' {
    /**
     * @param {string} start
     * @param {string} end
     * @returns {string[]}
     */
    export function charRange(start: string, end: string): string[];
}
declare module 'jet/rectangle.js' {
    export class Rectangle {
        /**
         * @param {Vector2} position
         * @param {number} width
         * @param {number} height
         */
        constructor(position: Vector2, width: number, height: number);
        position: Vector2;
        width: number;
        height: number;
        center: Vector2;
        left: number;
        right: number;
        top: number;
        bottom: number;
        /**
         * @param {Vector2} point
         * @returns {boolean}
         */
        isInside(point: Vector2): boolean;
        /**
         * @param {Rectangle} other
         * @returns {boolean}
         */
        intersectsWith(other: Rectangle): boolean;
        /**
         * @returns {Rectangle}
         */
        copy(): Rectangle;
        /**
         * @returns {string}
         */
        toString(): string;
        /**
         * @returns {Vector2}
         */
        bottomLeft(): Vector2;
        /**
         * @returns {Vector2}
         */
        bottomCenter(): Vector2;
    }
    import { Vector2 } from 'jet/vector_2.js';
}
declare module 'jet/drawing_context.js' {
    export class DrawingContext {
        /**
         * @param {HTMLCanvasElement} canvas
         */
        constructor(canvas: HTMLCanvasElement);
        canvas: HTMLCanvasElement;
        canvasContext: CanvasRenderingContext2D;
        position: Vector2;
        /**
         * @param {HTMLImageElement} image
         * @param {import('./rectangle.js').Rectangle} srcRect
         * @param {import('./rectangle.js').Rectangle} dstRect
         */
        drawImage(
            image: HTMLImageElement,
            srcRect: import('jet/rectangle.js').Rectangle,
            dstRect: import('jet/rectangle.js').Rectangle
        ): void;
        /**
         * @param {string} text
         * @param {Vector2} position
         * @param {number} size
         * @param {CanvasTextAlign} alignment
         */
        drawText(
            text: string,
            position: Vector2,
            size: number,
            alignment: CanvasTextAlign
        ): void;
        /**
         * @param {import('./rectangle.js').Rectangle} rect
         * @param {string} color
         */
        drawRect(
            rect: import('jet/rectangle.js').Rectangle,
            color: string
        ): void;
    }
    import { Vector2 } from 'jet/vector_2.js';
}
declare module 'jet/game_object.js' {
    export class GameObject {
        /**
         * @param {import('./vector_2.js').Vector2} position
         * @param {string} label
         */
        constructor(position: import('jet/vector_2.js').Vector2, label: string);
        _label: string;
        position: import('jet/vector_2.js').Vector2;
        /** @type {GameObject[]} */
        _children: GameObject[];
        /**
         * @param {GameObject} child
         * @param {number | null} index
         */
        addChild(child: GameObject, index?: number | null): void;
        /**
         * @param {((b: import('./game_object.js').GameObject) => void)} func
         */
        forEachChild(
            func: (b: import('jet/game_object.js').GameObject) => void
        ): void;
        /**
         * @param {GameObject} child
         */
        removeChild(child: GameObject): void;
        /**
         * @param {number} elapsedMs
         */
        updateChildren(elapsedMs: number): void;
        /**
         * @param {import('./drawing_context.js').DrawingContext} drawingContext
         */
        drawChildren(
            drawingContext: import('jet/drawing_context.js').DrawingContext
        ): void;
        /**
         * @abstract
         * @param {number} _elapsedMs
         */
        update(_elapsedMs: number): void;
        /**
         * @abstract
         * @param {import('./drawing_context.js').DrawingContext} _drawingContext
         */
        draw(
            _drawingContext: import('jet/drawing_context.js').DrawingContext
        ): void;
    }
}
declare module 'jet/container.js' {
    export class Container extends GameObject {
        constructor();
    }
    import { GameObject } from 'jet/game_object.js';
}
declare module 'jet/enum.js' {
    /**
     * @template {Record<string, number>} T
     * @param {T} baseEnum
     * @returns {{ readonly [K in keyof T]: T[K] }}
     */
    export function createEnum<T extends Record<string, number>>(
        baseEnum: T
    ): { readonly [K in keyof T]: T[K] };
}
declare module 'jet/game_engine.js' {
    export class GameEngine {
        /**
         * @param {import('./game_object.js').GameObject} rootGameObj
         * @param {import('./game_object.js').GameObject} camera
         * @param {HTMLCanvasElement} canvas
         * @param {number} updateIntervalMs
         */
        constructor(
            rootGameObj: import('jet/game_object.js').GameObject,
            camera: import('jet/game_object.js').GameObject,
            canvas: HTMLCanvasElement,
            updateIntervalMs: number
        );
        _drawingContext: DrawingContext;
        _lastUpdateTimeMs: number;
        _accumulatedTimeMs: number;
        _updateIntervalMs: number;
        _rootGameObj: import('jet/game_object.js').GameObject;
        _camera: import('jet/game_object.js').GameObject;
        /** @type {null | number} */
        _updateCallId: null | number;
        _started: boolean;
        /**
         * @param {number} timeMs
         */
        _update: (timeMs: number) => void;
        _scheduleUpdateCall(): void;
        _unscheduleUpdateCall(): void;
        start(): void;
        stop(): void;
    }
    import { DrawingContext } from 'jet/drawing_context.js';
}
declare module 'jet/json_file.js' {
    export class JsonFile {
        /**
         * @param {Document} htmlDocument
         * @param {JSON} jsonParser
         * @param {string} relPath
         * @param {(file: JsonFile) => void} onLoaded
         */
        constructor(
            htmlDocument: Document,
            jsonParser: JSON,
            relPath: string,
            onLoaded: (file: JsonFile) => void
        );
        _relPath: string;
        _onLoaded: (file: JsonFile) => void;
        _jsonParser: JSON;
        _httpRequest: XMLHttpRequest;
        _url: URL;
        /**
         * @type {() => void}
         * @private
         */
        private _onReadyStateChange;
        _data: any;
        get data(): any;
    }
}
declare module 'jet/object_factory.js' {
    /**
     * @typedef {{
     *   constructor: new (args: any) => any,
     *   context?: Record<string, any>
     * }} Blueprint
     * @typedef {Record<string, Blueprint>} BlueprintDict
     */
    export class ObjectFactory {
        /**
         * @param {Blueprint[]} blueprintsArray
         */
        constructor(blueprintsArray: Blueprint[]);
        /** @type {Record<string, Blueprint>} */
        _blueprints: Record<string, Blueprint>;
        /**
         * @param {string} blueprintName
         * @param {Record<string, string | number | boolean | null>} params
         * @returns {InstanceType<BlueprintDict[string]['constructor']>}
         */
        createObj(
            blueprintName: string,
            params?: Record<string, string | number | boolean | null>
        ): InstanceType<BlueprintDict[string]['constructor']>;
        /**
         * @param {{ class: string, params?: Record<string, any> }} json
         * @returns {InstanceType<BlueprintDict[string]['constructor']>}
         */
        createObjFromJson(json: {
            class: string;
            params?: Record<string, any>;
        }): InstanceType<BlueprintDict[string]['constructor']>;
    }
    export type Blueprint = {
        constructor: new (args: any) => any;
        context?: Record<string, any>;
    };
    export type BlueprintDict = Record<string, Blueprint>;
}
declare module 'jet/timeout.js' {
    export class Timeout extends GameObject {
        /**
         * @param {number} ms
         * @param {(() => void) | null} action
         */
        constructor(ms?: number, action?: (() => void) | null);
        /** @type {(() => void) | null} */
        _action: (() => void) | null;
        /** @type {number} */
        _ms: number;
        /**
         * @param {number} ms
         * @param {(() => void) | null} action
         */
        set(ms: number, action?: (() => void) | null): void;
        /**
         * @returns {boolean}
         */
        running(): boolean;
    }
    import { GameObject } from 'jet/game_object.js';
}
declare module 'jet/periodic_timeout.js' {
    export class PeriodicTimeout extends GameObject {
        /**
         * @param {number} ms
         * @param {(() => void) | null} action
         */
        constructor(ms?: number, action?: (() => void) | null);
        /** @type {number} */
        _ms: number;
        /** @type {(() => void) | null} */
        _action: (() => void) | null;
        /** @type {Timeout} */
        _timeout: Timeout;
        /**
         * @param {number} ms
         * @param {(() => void) | null} action
         */
        set(ms?: number, action?: (() => void) | null): void;
        /**
         * @returns {boolean}
         */
        running(): boolean;
    }
    import { GameObject } from 'jet/game_object.js';
    import { Timeout } from 'jet/timeout.js';
}
declare module 'jet/sprite.js' {
    export class Sprite extends GameObject {
        /**
         * @param {import('./image_file.js').ImageFile} image
         * @param {import('./vector_2.js').Vector2=} frameSize
         * @param {number=} numColumns
         * @param {number=} numRows
         * @param {number=} atFrameIdx
         * @param {import('./vector_2.js').Vector2} framePadding
         */
        constructor(
            image: import('jet/image_file.js').ImageFile,
            frameSize?: import('jet/vector_2.js').Vector2 | undefined,
            numColumns?: number | undefined,
            numRows?: number | undefined,
            atFrameIdx?: number | undefined,
            framePadding?: import('jet/vector_2.js').Vector2
        );
        _image: import('jet/image_file.js').ImageFile;
        _frameSize: Vector2;
        _framePadding: Vector2;
        _numColumns: number;
        _numRows: number;
        _atFrameIdx: number;
        /** @type {Map<number, Vector2>} */
        _frameMap: Map<number, Vector2>;
        _initializeFrameMap(): void;
        /**
         * @returns {number}
         */
        frameWidth(): number;
        /**
         * @returns {number}
         */
        frameHeight(): number;
        /**
         * @param {number} index
         */
        goToFrame(index: number): number;
    }
    import { GameObject } from 'jet/game_object.js';
    import { Vector2 } from 'jet/vector_2.js';
}
declare module 'jet/sprite_font.js' {
    export class SpriteFontSource {
        /**
         * @param {import('./image_file.js').ImageFile} image
         * @param {Vector2} charSize
         * @param {Map<Vector2, string[]>} chars
         */
        constructor(
            image: import('jet/image_file.js').ImageFile,
            charSize: Vector2,
            chars: Map<Vector2, string[]>
        );
        image: import('jet/image_file.js').ImageFile;
        charSize: Vector2;
        /** @type {Map<string, Vector2>} */
        charPositions: Map<string, Vector2>;
    }
    export class SpriteFont {
        /**
         * @param {SpriteFontSource} src
         * @param {number} yShift
         * @param {number} scalingFactor
         */
        constructor(
            src: SpriteFontSource,
            yShift: number,
            scalingFactor?: number
        );
        _src: SpriteFontSource;
        _yShift: number;
        _dstCharSize: Vector2;
        /**
         * @returns {number}
         */
        charWidth(): number;
        /**
         * @returns {number}
         */
        lineHeight(): number;
        /**
         * @param {import('./drawing_context.js').DrawingContext} drawingContext
         * @param {Vector2} position
         * @param {string} c
         */
        drawChar(
            drawingContext: import('jet/drawing_context.js').DrawingContext,
            position: Vector2,
            c: string
        ): void;
        /**
         * @param {import('./drawing_context.js').DrawingContext} drawingContext
         * @param {Vector2} position
         * @param {string} str
         */
        drawString(
            drawingContext: import('jet/drawing_context.js').DrawingContext,
            position: Vector2,
            str: string
        ): void;
    }
    import { Vector2 } from 'jet/vector_2.js';
}
declare module 'jet/timed_value.js' {
    /**
     * @template T
     * @typedef {object} TimedValuePhase
     * @property {number} ms
     * @property {T} value
     */
    /**
     * @template T
     */
    export class TimedValue<T> extends GameObject {
        /**
         * @param {TimedValuePhase<T>[]} phases
         */
        constructor(phases: TimedValuePhase<T>[]);
        _phases: TimedValuePhase<T>[];
        _phaseIdx: number;
        _remainingTimeMs: number;
        /**
         * @param {number} phaseIdx
         */
        startPhase(phaseIdx: number): void;
        /**
         * @param {number} phaseIdx
         */
        startPhaseWithRandomTimeOffset(phaseIdx: number): void;
        /**
         * @returns {T}
         */
        value(): T;
    }
    export type TimedValuePhase<T> = {
        ms: number;
        value: T;
    };
    import { GameObject } from 'jet/game_object.js';
}
