import { GameObject } from './game_object.js';
import { Sprite } from './sprite.js';
import { Vector2 } from './vector_2.js';

export class Asteroid extends GameObject {
    constructor(image) {
        let size = new Vector2(172, 172);
        super(new Vector2(-50, -86), 'Asteroid');
        this.sprite = new Sprite(image);
        this.size = size;
        this.speed = 25.0 / 1000;
        this.addChild(this.sprite);
    }

    update(elapsedMs) {
        this.position.y += this.speed * elapsedMs;
        this.updateChildren(elapsedMs);
    }

    draw(drawingContext) {
        this.drawChildren(drawingContext);
    }

    outOfSight() {
        return this.position.y < -this.size.y;
    }
}
