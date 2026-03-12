import { randomInt } from './math.js';

/**
 * @template T
 * @param {T[]} array
 * @param {T} item
 */
export function removeItem(array, item) {
    const index = array.indexOf(item);
    if (index < 0) {
        return;
    }
    array.splice(index, 1);
}

/**
 * @template T
 * @param {T[]} array
 * @returns {T}
 */
export function getRandomItem(array) {
    return array[randomInt(0, array.length)];
}

/**
 * @template T
 * @param {T[]} array
 * @returns {T[]}
 */
export function cloneArray(array) {
    return array.slice();
}

/**
 * @template T
 * @param {T[]} availableItems
 * @param {number} numItems
 * @returns {T[]}
 */
export function makeRandomSelection(availableItems, numItems) {
    const selectedItems = [];
    const unselectedItems = cloneArray(availableItems);
    if (numItems > unselectedItems.length) {
        numItems = unselectedItems.length;
        console.warn(
            'Warning: Number of items to select is greater than number of available items'
        );
    }
    while (selectedItems.length < numItems) {
        const idx = randomInt(0, unselectedItems.length);
        selectedItems.push(unselectedItems[idx]);
        unselectedItems.splice(idx, 1);
    }
    return selectedItems;
}

/**
 * @template T
 * @param {T[]} array
 * @returns {T}
 */
export function lastItem(array) {
    return array[array.length - 1];
}
