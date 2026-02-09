/**
 * @template {Record<string, number>} T
 * @param {T} baseEnum
 * @returns {Readonly<T>}
 */
export function createEnum(baseEnum) {
    return new Proxy(baseEnum, {
        get(target, name) {
            if (!Object.prototype.hasOwnProperty.call(baseEnum, name)) {
                throw new Error(`'${name}' value does not exist in the enum`);
            }
            return target[name];
        },

        set(_target, _name, _value) {
            throw new Error('Cannot add a new value to the enum');
        },
    });
}
