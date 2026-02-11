import { GameObject } from './game_object.js';
import { Rectangle } from './rectangle.js';
import { Vector2 } from './vector_2.js';
import { FONT_LINE_HEIGHT } from './parameters.js';

const STATUS_BAR_PADDING = new Vector2(4, 2);
const STATUS_BAR_BORDER_SIZE = 1;
const STATUS_BAR_BORDER_COLOR = 'rgba(184, 184, 73)';
const STATUS_BAR_FILL_COLOR = 'rgb(0,0,0)';

export const STATUS_BAR_HEIGHT =
    FONT_LINE_HEIGHT + 2 * STATUS_BAR_BORDER_SIZE + 2 * STATUS_BAR_PADDING.y;

export class StatusBar extends GameObject {
    /**
     * @param {Vector2} position
     * @param {number} width
     * @param {import('./sprite_font.js').SpriteFont} font
     * @param {number} score
     * @param {number} bonus
     */
    constructor(position, width, font, score, bonus) {
        super(new Vector2(0, 0), 'StatusBar');

        this._font = font;
        this._borderRect = new Rectangle(
            position.copy(),
            width,
            STATUS_BAR_HEIGHT
        );
        this._fillRect = new Rectangle(
            position
                .copy()
                .add(
                    new Vector2(STATUS_BAR_BORDER_SIZE, STATUS_BAR_BORDER_SIZE)
                ),
            width - 2 * STATUS_BAR_BORDER_SIZE,
            STATUS_BAR_HEIGHT - 2 * STATUS_BAR_BORDER_SIZE
        );
        this._scoreBonusStr = '';
        this.updateScoreBonusStr(score, bonus);

        this._scoreBonusStrPos = this._fillRect.position
            .copy()
            .add(STATUS_BAR_PADDING);
    }

    /**
     * @param {number} score
     * @param {number} bonus
     */
    updateScoreBonusStr(score, bonus) {
        this._scoreBonusStr = `Score: ${String(score).padEnd(8, ' ')}  Bonus: ${bonus}`;
    }

    /**
     * @param {import('drawing_context.js').DrawingContext} drawingContext
     */
    draw(drawingContext) {
        this.drawChildren(drawingContext);
        drawingContext.drawRect(this._borderRect, STATUS_BAR_BORDER_COLOR);
        drawingContext.drawRect(this._fillRect, STATUS_BAR_FILL_COLOR);
        this._font.drawString(
            drawingContext,
            this._scoreBonusStrPos,
            this._scoreBonusStr
        );
    }

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        this.updateChildren(elapsedMs);
    }
}
