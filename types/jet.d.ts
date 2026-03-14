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
declare module 'jet/char.js' {
    /**
     * @param {string} start
     * @param {string} end
     * @returns {string[]}
     */
    export function charRange(start: string, end: string): string[];
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
