import { GameObject } from './game_object.js';
import { Vector2 } from './vector_2.js';

export class MainMenu extends GameObject {
    /**
     * @param {import('./rectangle.js').Rectangle} rect
     * @param {import('./sprite_font.js').SpriteFont} titleFont
     */
    constructor(rect, titleFont) {
        super(null, 'MainMenu');

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
    }

    /**
     * @param {number} _deltaMs
     */
    update(_deltaMs) {}

    /**
     * @param {import('drawing_context.js').DrawingContext} drawingContext
     */
    draw(drawingContext) {
        this._titleFont.drawString(drawingContext, this._titlePos, this._title);
    }
}
