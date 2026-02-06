import { Vector2 } from './vector_2.js';

export function lerp(src, dst, amount) {
    return src + (dst - src) * amount;
}

export function lerpVec2(src, dst, factor) {
    return new Vector2(lerp(src.x, dst.x, factor), lerp(src.y, dst.y, factor));
}

export function floorVec2(vec) {
    return new Vector2(Math.floor(vec.x), Math.floor(vec.y));
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function randomInt(minInclusive, maxExclusive) {
    return (
        Math.floor(Math.random() * (maxExclusive - minInclusive)) + minInclusive
    );
}

export function rotateQuadrMatrix2CoordClockwise(
    coord,
    matrixSize,
    numRotations
) {
    const rotatedCoord = coord.copy();
    for (let idx = 0; idx < numRotations; idx++) {
        const x = rotatedCoord.x;
        rotatedCoord.x = matrixSize - 1 - rotatedCoord.y;
        rotatedCoord.y = x;
    }
    return rotatedCoord;
}
