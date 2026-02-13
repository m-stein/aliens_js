import { GameObject } from './game_object.js';
import { Rectangle } from './rectangle.js';
import { Vector2 } from './vector_2.js';
import { FONT_LINE_HEIGHT } from './parameters.js';

const STATUS_BAR_PADDING = new Vector2(4, 2);
const STATUS_BAR_BORDER_SIZE = 1;
const STATUS_BAR_BORDER_COLOR_1 = 'rgba(200, 200, 0)';
const STATUS_BAR_BORDER_COLOR_2 = 'rgba(150, 150, 0)';
const STATUS_BAR_FILL_COLOR = 'rgb(0,0,0)';
const MAX_NUM_LIVES = 3;
const LIVES_SPACING = 2;

export const STATUS_BAR_HEIGHT =
    FONT_LINE_HEIGHT + 2 * STATUS_BAR_BORDER_SIZE + 2 * STATUS_BAR_PADDING.y;

export class StatusBar extends GameObject {
    /**
     * @param {Vector2} position
     * @param {number} width
     * @param {import('./sprite_font.js').SpriteFont} font
     * @param {number} score
     * @param {number} bonus
     * @param {import('./image_file.js').ImageFile} liveImg
     */
    constructor(position, width, font, score, bonus, liveImg) {
        super(new Vector2(0, 0), 'StatusBar');

        this._font = font;
        this._borderRect1 = new Rectangle(
            position.copy(),
            width,
            STATUS_BAR_HEIGHT / 2
        );
        this._borderRect2 = new Rectangle(
            this._borderRect1.bottomLeft(),
            width,
            STATUS_BAR_HEIGHT / 2
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

        this._numLives = MAX_NUM_LIVES;
        this._liveImg = liveImg;
        this._liveSrcRectangle = new Rectangle(
            new Vector2(0, 0),
            this._liveImg.htmlElement.width,
            this._liveImg.htmlElement.height
        );
        this._liveDstRectangles = [];
        for (let idx = 0; idx < MAX_NUM_LIVES; idx++) {
            this._liveDstRectangles[idx] = new Rectangle(
                new Vector2(
                    this._fillRect.right -
                        STATUS_BAR_PADDING.x -
                        idx * LIVES_SPACING -
                        (idx + 1) * this._liveImg.htmlElement.width,
                    this._fillRect.top + STATUS_BAR_PADDING.y
                ),
                this._liveImg.htmlElement.width,
                this._liveImg.htmlElement.height
            );
        }
    }

    /**
     * @param {number} score
     * @param {number} bonus
     */
    updateScoreBonusStr(score, bonus) {
        this._scoreBonusStr = `Score: ${String(score).padEnd(8, ' ')}  Bonus: ${bonus}`;
    }

    decrNumLives() {
        if (this._numLives > 0) {
            this._numLives -= 1;
        }
    }

    /**
     * @return {number}
     */
    numLives() {
        return this._numLives;
    }

    /**
     * @param {import('drawing_context.js').DrawingContext} drawingContext
     */
    draw(drawingContext) {
        this.drawChildren(drawingContext);
        drawingContext.drawRect(this._borderRect1, STATUS_BAR_BORDER_COLOR_1);
        drawingContext.drawRect(this._borderRect2, STATUS_BAR_BORDER_COLOR_2);
        drawingContext.drawRect(this._fillRect, STATUS_BAR_FILL_COLOR);
        this._font.drawString(
            drawingContext,
            this._scoreBonusStrPos,
            this._scoreBonusStr
        );
        for (let idx = 0; idx < this._numLives; idx++) {
            drawingContext.drawImage(
                this._liveImg.htmlElement,
                this._liveSrcRectangle,
                this._liveDstRectangles[idx]
            );
        }
    }

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        this.updateChildren(elapsedMs);
    }
}
