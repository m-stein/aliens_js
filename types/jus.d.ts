/**
 * This file originates from the Jus game engine.
 *
 * If you want to use Jus in your JavaScript project, the file can provide the
 * public interface of Jus to your type server, thereby enabling type checking,
 * import checking, and code completion. Just copy the correct version of this
 * file to the types/ sub-directory in your project directory and make sure to
 * add it to the "include" array in your jsconfig.json file.
 */
declare module 'jus' {
    export type BlueprintParams = Record<
        string,
        string | number | boolean | null
    >;
    export type Blueprint = {
        constructor: new (args: any) => any;
        context?: Record<string, any>;
    };
    export class ObjectFactory {
        constructor(blueprintsArray: Blueprint[]);
        createObj(blueprintName: string, params?: BlueprintParams): any;
        createObjFromJson(json: {
            class: string;
            params?: Record<string, any>;
        }): any;
    }
    export class JsonFile {
        constructor(
            htmlDocument: Document,
            jsonParser: JSON,
            relPath: string,
            onLoaded: (file: JsonFile) => void
        );
        get data(): any;
    }
}
