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
    constructor(blueprintsArray) {
        /** @type {Record<string, Blueprint>} */
        this._blueprints = {};
        for (const blueprint of blueprintsArray) {
            const className = blueprint.constructor.name;
            if (!className) {
                throw new Error('Blueprint must have a class name');
            }
            if (this._blueprints[className]) {
                throw new Error(`Duplicate blueprint for class ${className}`);
            }
            this._blueprints[className] = blueprint;
        }
    }

    /**
     * @param {string} blueprintName
     * @param {Record<string, string | number | boolean | null>} params
     * @returns {InstanceType<BlueprintDict[string]['constructor']>}
     */
    createObj(blueprintName, params = {}) {
        const blueprint = this._blueprints[blueprintName];
        if (!blueprint) {
            throw new Error(`Unknown blueprint: ${String(blueprintName)}`);
        }
        const context = blueprint.context ?? {};
        const Constructor = blueprint.constructor;
        return new Constructor({
            ...context,
            ...params,
        });
    }
    /**
     * @param {{ class: string, params?: Record<string, any> }} json
     * @returns {InstanceType<BlueprintDict[string]['constructor']>}
     */
    createObjFromJson(json) {
        if (typeof json.class !== 'string') {
            throw new Error('JSON must have a "class" property');
        }
        const { class: className, params = {} } = json;
        return this.createObj(className, params);
    }
}
