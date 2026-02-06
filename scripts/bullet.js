import { GameObject } from './game_object.js';
import { Rectangle } from './rectangle.js';
import { Sprite } from './sprite.js';
import { Vector2 } from './vector_2.js';

export class Bullet extends GameObject {
    constructor(rifleTip, image) {
        let size = new Vector2(3, 7);
        super(
            new Vector2(rifleTip.x - size.x / 2, rifleTip.y - size.y),
            'Bullet'
        );
        this.sprite = new Sprite({ sourceImage: image });
        this.size = size;
        this.speed = 600.0 / 1000;
        this.colliderOffset = this.sprite.position.copy();
        this.addChild(this.sprite);
    }

    update(deltaTime) {
        this.position.y -= this.speed * deltaTime;
        this.updateChildren(deltaTime);
    }

    draw(drawingContext) {
        this.drawChildren(drawingContext);
    }

    outOfSight() {
        return this.position.y < -this.size.y;
    }

    /**
     * @returns {Rectangle}
     */
    collider() {
        return new Rectangle(this.position.copy(), this.size.x, this.size.y);
    }
}
