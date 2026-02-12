import { Rectangle } from './rectangle.js';
import { Vector2 } from './vector_2.js';

export class SpriteFont {
    /**
     * @param {ImageFile} spriteSheet
     * @param {Vector2} charSize
     * @param {number} yShift
     * @param {Map<Vector2, string[]>} chars
     */
    constructor(spriteSheet, charSize, yShift, chars) {
        this._spritesheet = spriteSheet;

        /** @type {Map<string, Rectangle>} */
        this._charSrcRects = new Map();

        /** @type {Vector2} */
        this._charSize = charSize;

        /** @type {number} */
        this._yShift = yShift;

        const sheetEl = this._spritesheet.htmlElement;

        for (const [keyPos, charArray] of chars.entries()) {
            let charPos = new Vector2(
                keyPos.x * this._charSize.x,
                keyPos.y * this._charSize.y
            );

            for (const c of charArray) {
                this._charSrcRects.set(
                    c,
                    new Rectangle(
                        new Vector2(charPos.x, charPos.y),
                        this._charSize.x,
                        this._charSize.y
                    )
                );

                charPos.x += this._charSize.x;

                if (charPos.x > sheetEl.width - this._charSize.x) {
                    charPos.x = 0;
                    charPos.y += this._charSize.y;
                }
            }
        }
    }

    /**
     * @returns {number}
     */
    charWidth() {
        return this._charSize.x;
    }

    /**
     * @returns {number}
     */
    lineHeight() {
        return this._charSize.y;
    }

    /**
     * @param {DrawingContext} drawingContext
     * @param {Vector2} position
     * @param {string} c
     */
    drawChar(drawingContext, position, c) {
        const ctx = drawingContext.canvasContext ?? drawingContext;
        const srcRect = this._charSrcRects.get(c);
        if (!srcRect) {
            return;
        }
        const img = this._spritesheet.htmlElement;
        ctx.drawImage(
            img,
            srcRect.position.x,
            srcRect.position.y,
            srcRect.width,
            srcRect.height,
            position.x,
            position.y + this._yShift,
            srcRect.width,
            srcRect.height
        );
    }

    /**
     * @param {DrawingContext} drawingContext
     * @param {Vector2} position
     * @param {string} str
     */
    drawString(drawingContext, position, str) {
        const charWidth = this._charSize.x;
        const lineHeight = this._charSize.y;
        let x = position.x;
        let y = position.y;
        for (let i = 0; i < str.length; i++) {
            const c = str[i];
            if (c === '\n') {
                x = position.x;
                y += lineHeight;
                continue;
            }
            this.drawChar(drawingContext, new Vector2(x, y), c);
            x += charWidth;
        }
    }
}
