import { GameObject } from './game_object.js';
import { Vector2 } from './vector_2.js';

export class MainMenu extends GameObject {
    /**
     * @param {import('./rectangle.js').Rectangle} rect
     * @param {import('./sprite_font.js').SpriteFont} font
     */
    constructor(rect, font) {
        super(null, 'MainMenu');

        this._rect = rect;
        this._font = font;
        this._title = 'ALIENS!';
        this._titlePos = new Vector2(
            this._rect.position.x +
                Math.floor(
                    (this._rect.width -
                        this._title.length * this._font.charWidth()) /
                        2
                ),
            this._rect.position.y +
                Math.floor((this._rect.height - this._font.lineHeight()) / 2)
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
        this._font.drawString(drawingContext, this._titlePos, this._title);
    }
}
