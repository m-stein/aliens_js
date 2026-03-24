import { GameObject } from 'jet/game_object.js';
import { Vector2 } from 'jet/vector_2.js';
import { Rectangle } from 'jet/rectangle.js';
import { Sprite } from 'jet/sprite.js';
import { TimedValue } from 'jet/timed_value.js';
import { createEnum } from 'jet/enum.js';
import { Timeout } from 'jet/timeout.js';
import { DRAW_COLLIDERS, DRAW_COLLIDERS_COLOR } from './parameters.js';

export class Player extends GameObject {
    static State = createEnum({
        Alive: 0,
        Respawning: 1,
    });

    static RESPAWN_TIMEOUT_MS = 2000;

    /**
     * @param {Rectangle} fbRect
     * @param {import('jet/image_file.js').ImageFile} image
     * @param {Set<string>} pressedKeys
     */
    constructor(fbRect, image, pressedKeys) {
        super(new Vector2(fbRect.width / 2 - 16, fbRect.height - 32), 'Player');
        this._state = Player.State.Alive;
        this._sprite = new Sprite(image, new Vector2(32, 32), 2, 1);
        this._rifleTipOffset = new Vector2(15.5, 4);
        this._fbRect = fbRect;
        this.pressedKeys = pressedKeys;
        this.speed = 300 / 1000;
        this.colliderOffset = new Vector2(10, 7);
        this.colliderSize = new Vector2(11, 17);
        this.minY = this._fbRect.top;
        this.maxY =
            this._fbRect.height - this.colliderOffset.y - this.colliderSize.y;
        this.minX = -this.colliderOffset.x;
        this.maxX =
            this._fbRect.width - this.colliderOffset.x - this.colliderSize.x;
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
            this._finishRespawning
        );
        this.respawnAt = this.position.copy();
        this.addChild(this.frameIdx);
        this.addChild(this._sprite);
    }

    _finishRespawning = () => {
        this._state = Player.State.Alive;
        this.removeChild(this.respawnTimeout);
        this.removeChild(this.respawnVisibility);
    };

    /**
     * @returns {Vector2}
     */
    rifleTip() {
        return new Vector2(
            this.position.x + this._rifleTipOffset.x,
            this.position.y + this._rifleTipOffset.y
        );
    }

    /**
     * @returns {boolean}
     */
    readyToShoot() {
        return this._state == Player.State.Alive;
    }

    /**
     * @param {import('jet/drawing_context.js').DrawingContext} drawingContext
     */
    draw(drawingContext) {
        if (
            this._state == Player.State.Respawning &&
            !this.respawnVisibility.value()
        ) {
            return;
        }
        this.drawChildren(drawingContext);
        if (DRAW_COLLIDERS) {
            drawingContext.drawRect(this.collider(), DRAW_COLLIDERS_COLOR);
        }
    }

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        this.updateChildren(elapsedMs);
        this._updatePosition(elapsedMs);
        this._sprite.goToFrame(this.frameIdx.value());
    }

    /**
     * @returns {boolean}
     */
    vulnerable() {
        return this._state == Player.State.Alive;
    }

    respawn() {
        this._state = Player.State.Respawning;
        this.respawnVisibility.startPhase(0);
        this.respawnTimeout.set(Player.RESPAWN_TIMEOUT_MS);
        this.position = this.respawnAt.copy();
        this.addChild(this.respawnTimeout);
        this.addChild(this.respawnVisibility);
    }

    /**
     * @param {number} elapsedMs
     */
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
            if (diff.y < 0) {
                diff.y /= 1.2;
            } else if (diff.y > 0) {
                diff.y *= 1.2;
            }
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

    /**
     * @returns {Rectangle}
     */
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
