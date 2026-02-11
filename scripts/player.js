import { GameObject } from './game_object.js';
import { Vector2 } from './vector_2.js';
import { Rectangle } from './rectangle.js';
import { Sprite } from './sprite.js';
import { TimedValue } from './timed_value.js';
import { createEnum } from './enum.js';
import { Timeout } from './timeout.js';
import { DRAW_COLLIDERS, DRAW_COLLIDERS_COLOR } from './parameters.js';

export class Player extends GameObject {
    static State = createEnum({
        Alive: 0,
        Respawning: 1,
    });

    static RESPAWN_TIMEOUT_MS = 2000;

    constructor(fbRect, image, pressedKeys) {
        super(new Vector2(fbRect.width / 2 - 16, fbRect.height - 32), 'Player');
        this.state = Player.State.Alive;
        this.sprite = new Sprite(image, new Vector2(32, 32), 2, 1);
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
        this.respawnVisibility = new TimedValue([
            { ms: 150, value: true },
            { ms: 150, value: false },
        ]);
        this.respawnTimeout = new Timeout(
            Player.RESPAWN_TIMEOUT_MS,
            this.finishRespawning
        );
        this.respawnAt = this.position.copy();
        this.addChild(this.frameIdx);
        this.addChild(this.sprite);
    }

    finishRespawning = () => {
        this.state = Player.State.Alive;
        this.removeChild(this.respawnTimeout);
        this.removeChild(this.respawnVisibility);
    };

    rifleTip() {
        return new Vector2(
            this.position.x + this.rifleTipOffset.x,
            this.position.y + this.rifleTipOffset.y
        );
    }

    readyToShoot() {
        return this.state == Player.State.Alive;
    }

    /**
     * @param {DrawingContext} drawingContext
     */
    draw(drawingContext) {
        if (
            this.state == Player.State.Respawning &&
            !this.respawnVisibility.value()
        ) {
            return;
        }
        this.drawChildren(drawingContext);
        if (DRAW_COLLIDERS) {
            drawingContext.drawRect(this.collider(), DRAW_COLLIDERS_COLOR);
        }
    }

    update(elapsedMs) {
        this.updateChildren(elapsedMs);
        this._updatePosition(elapsedMs);
        this.sprite.goToFrame(this.frameIdx.value());
    }

    /**
     * @returns {boolean}
     */
    vulnerable() {
        return this.state == Player.State.Alive;
    }

    respawn() {
        this.state = Player.State.Respawning;
        this.respawnVisibility.startPhase(0);
        this.respawnTimeout.set(Player.RESPAWN_TIMEOUT_MS);
        this.position = this.respawnAt.copy();
        this.addChild(this.respawnTimeout);
        this.addChild(this.respawnVisibility);
    }

    _updatePosition(elapsedMs) {
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
            let diff = direction.normalized().scale(this.speed * elapsedMs);
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
