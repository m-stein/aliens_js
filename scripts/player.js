import { GameObject } from './game_object.js';
import { Vector2 } from './vector_2.js';
import { Rectangle } from './rectangle.js';
import { Sprite } from './sprite.js';
import { TimedValue } from './timed_value.js';

export class Player extends GameObject {
    constructor(fbRect, image, pressedKeys) {
        super(new Vector2(200, 250), 'Player');
        this.sprite = new Sprite({
            position: new Vector2(0, 0),
            sourceImage: image,
            frameSize: new Vector2(32, 32),
            numColumns: 2,
            numRows: 1,
            drawFrameIndex: 0,
        });
        this.rifleTipOffset = new Vector2(15.5, 4);
        this.fbRect = fbRect;
        this.pressedKeys = pressedKeys;
        this.speed = 300 / 1000;
        this.colliderOffset = new Vector2(10, 7);
        this.colliderSize = new Vector2(11, 17);
        this.minY = this.fbRect.height - 100 - this.colliderOffset.y;
        this.maxY =
            this.fbRect.height - this.colliderOffset.y - this.colliderSize.y;
        this.minX = -this.colliderOffset.x;
        this.maxX =
            this.fbRect.width - this.colliderOffset.x - this.colliderSize.x;
        this.frameIdx = new TimedValue([
            { ms: 100, value: 0 },
            { ms: 100, value: 1 },
        ]);
        this.addChild(this.frameIdx);
        this.addChild(this.sprite);
    }

    rifleTip() {
        return new Vector2(
            this.position.x + this.rifleTipOffset.x,
            this.position.y + this.rifleTipOffset.y
        );
    }

    readyToShoot() {
        return true;
    }

    draw(drawingContext) {
        this.drawChildren(drawingContext);
    }

    update(deltaTime) {
        this.updateChildren(deltaTime);
        this._updatePosition(deltaTime);
        this.sprite.currFrameIndex = this.frameIdx.value();
    }

    _updatePosition(deltaTimeMs) {
        let direction = new Vector2(0, 0);
        if (this.pressedKeys.has('KeyA')) {
            direction.x -= 1;
        }
        if (this.pressedKeys.has('KeyD')) {
            direction.x += 1;
        }
        if (this.pressedKeys.has('KeyW')) {
            direction.y -= 1;
        }
        if (this.pressedKeys.has('KeyS')) {
            direction.y += 1;
        }
        if (direction.length() > 0) {
            let diff = direction.normalized().scale(this.speed * deltaTimeMs);
            this.position.add(diff);
            if (this.position.x < this.minX) {
                this.position.x = this.minX;
            }
            if (this.position.x > this.maxX) {
                this.position.x = this.maxX;
            }
            if (this.position.y < this.minY) {
                this.position.y = this.minY;
            }
            if (this.position.y > this.maxY) {
                this.position.y = this.maxY;
            }
        }
    }

    collider() {
        return new Rectangle(
            new Vector2(
                this.position.x + this.colliderOffset.x,
                this.position.y + this.colliderOffset.y
            ),
            this.colliderSize.x,
            this.colliderSize.y
        );
    }
}
