import { Vector2 } from './vector_2.js';

export class Rectangle {
    /**
     * @param {Vector2} position
     * @param {number} width
     * @param {number} height
     */
    constructor(position, width, height) {
        this.position = position;
        this.width = width;
        this.height = height;
        this.center = this.position
            .copy()
            .add(new Vector2(this.width / 2, this.height / 2));
        this.left = position.x;
        this.right = position.x + width;
        this.top = position.y;
        this.bottom = position.y + height;
    }

    /**
     * @param {Vector2} point
     * @returns {boolean}
     */
    isInside(point) {
        return (
            point.x >= this.position.x &&
            point.x < this.position.x + this.width &&
            point.y >= this.position.y &&
            point.y < this.position.y + this.height
        );
    }

    /**
     * @param {Rectangle} other
     * @returns {boolean}
     */
    intersectsWith(other) {
        return (
            this.left < other.right &&
            this.right > other.left &&
            this.top < other.bottom &&
            this.bottom > other.top
        );
    }

    /**
     * @returns {Rectangle}
     */
    copy() {
        return new Rectangle(this.position.copy(), this.width, this.height);
    }

    /**
     * @returns {string}
     */
    toString() {
        return `Rectangle(left=${this.left}, right=${this.right}, top=${this.top}, bottom=${this.bottom})`;
    }

    /**
     * @returns {Vector2}
     */
    bottomLeft() {
        return new Vector2(this.left, this.bottom);
    }

    /**
     * @returns {Vector2}
     */
    bottomCenter() {
        return new Vector2(this.center.x, this.bottom);
    }
}
