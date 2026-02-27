import { GameObject } from './game_object.js';
import { Timeout } from './timeout.js';
import { Vector2 } from './vector_2.js';

export class MainMenu extends GameObject {
    /**
     * @param {import('./rectangle.js').Rectangle} rect
     * @param {import('./sprite_font.js').SpriteFont} titleFont
     */
    constructor(rect, titleFont) {
        super(new Vector2(0, 0), 'MainMenu');

        this._rect = rect;
        this._titleFont = titleFont;
        this._title = 'ALIENS!';
        this._titlePos = new Vector2(
            this._rect.left +
                Math.floor(
                    (this._rect.width -
                        this._title.length * this._titleFont.charWidth()) /
                        2
                ),
            this._rect.position.y +
                Math.floor(
                    (this._rect.height - this._titleFont.lineHeight()) / 2
                )
        );
        this._acceptsInput = false;
        this._timeout = new Timeout(2000, () => {
            this._acceptsInput = true;
        });
        this.addChild(this._timeout);
    }

    /**
     * @returns {boolean}
     */
    acceptsInput() {
        return this._acceptsInput;
    }

    /**
     * @param {number} deltaMs
     */
    update(deltaMs) {
        this.updateChildren(deltaMs);
    }

    /**
     * @param {import('drawing_context.js').DrawingContext} drawingContext
     */
    draw(drawingContext) {
        this.drawChildren(drawingContext);
        this._titleFont.drawString(drawingContext, this._titlePos, this._title);
    }
}
