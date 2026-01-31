import { GameObject } from './game_object.js';
import { Vector2 } from './vector_2.js';
import { Rectangle } from './rectangle.js';
import { Sprite } from './sprite.js';
import { TimedValue } from "./timed_value.js";

export class Player extends GameObject
{
    constructor(fb_rect, image, pressed_keys) {
        super(new Vector2(200, 250), 'Player');
        this.sprite = new Sprite({
            position: new Vector2(0, 0),
            sourceImage: image,
            frameSize: new Vector2(32, 32),
            numColumns: 2,
            numRows: 1,
            drawFrameIndex: 0,
        });
        this.fb_rect = fb_rect
        this.pressed_keys = pressed_keys
        this.speed = 300 / 1000
        this.collider_offset = new Vector2(10, 7)
        this.collider_size = new Vector2(11, 17)
        this.min_y = this.fb_rect.height - 100 - this.collider_offset.y
        this.max_y = this.fb_rect.height - this.collider_offset.y - this.collider_size.y
        this.min_x = -this.collider_offset.x
        this.max_x = this.fb_rect.width - this.collider_offset.x - this.collider_size.x
        this.frameIdx = new TimedValue([
            { ms: 100, value: 0 },
            { ms: 100, value: 1 },
        ]);
        this.addChild(this.frameIdx);
        this.addChild(this.sprite);
    }

    draw(drawingContext) {
        this.drawChildren(drawingContext);
    }

    update(delta_time) {
        this.updateChildren(delta_time);
        this._update_position(delta_time)
        this.sprite.currFrameIndex = this.frameIdx.value();
    }

    _update_position(delta_time) {
        let direction = new Vector2(0, 0)
        if (this.pressed_keys.has("KeyA")) {
            direction.x -= 1
        }
        if (this.pressed_keys.has("KeyD")) {
            direction.x += 1
        }
        if (this.pressed_keys.has("KeyW")) {
            direction.y -= 1
        }
        if (this.pressed_keys.has("KeyS")) {
            direction.y += 1
        }
        if (direction.length() > 0) {
            let diff = direction.normalized().scale(this.speed * delta_time);
            this.position.add(diff);
            if (this.position.x < this.min_x) {
                this.position.x = this.min_x
            }
            if (this.position.x > this.max_x) {
                this.position.x = this.max_x
            }
            if (this.position.y < this.min_y) {
                this.position.y = this.min_y
            }
            if (this.position.y > this.max_y) {
                this.position.y = this.max_y
            }
        }
    }

    collider() {
        return Rectangle(
            new Vector2(
                this.position.x + this.collider_offset.x,
                this.position.y + this.collider_offset.y),
            this.collider_size.x,
            this.collider_size.y)
    }
}
