declare module 'jus/json_file.js' {
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
declare module 'jus/object_factory.js' {
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
declare module 'jus/vector_2.js' {
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
declare module 'jus/rectangle.js' {
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
    import { Vector2 } from 'jus/vector_2.js';
}
