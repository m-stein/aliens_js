import { Vector2 } from './vector_2.js';

export class SpriteFontSource {
    /**
     * @param {import('./image_file.js').ImageFile} image
     * @param {Vector2} charSize
     * @param {Map<Vector2, string[]>} chars
     */
    constructor(image, charSize, chars) {
        this.image = image;
        this.charSize = charSize;

        /** @type {Map<string, Vector2>} */
        this.charPositions = new Map();
        for (const [keyPos, charArray] of chars.entries()) {
            let charPos = new Vector2(
                keyPos.x * this.charSize.x,
                keyPos.y * this.charSize.y
            );
            for (const char of charArray) {
                this.charPositions.set(char, charPos.copy());
                charPos.x += this.charSize.x;
                if (
                    charPos.x >
                    this.image.htmlElement.width - this.charSize.x
                ) {
                    charPos.x = 0;
                    charPos.y += this.charSize.y;
                }
            }
        }
    }
}

export class SpriteFont {
    /**
     * @param {SpriteFontSource} src
     * @param {number} yShift
     * @param {number} scalingFactor
     */
    constructor(src, yShift, scalingFactor = 1) {
        this._src = src;
        this._yShift = yShift * scalingFactor;
        this._dstCharSize = this._src.charSize.copy().scale(scalingFactor);
    }

    /**
     * @returns {number}
     */
    charWidth() {
        return this._dstCharSize.x;
    }

    /**
     * @returns {number}
     */
    lineHeight() {
        return this._dstCharSize.y;
    }

    /**
     * @param {import('./drawing_context.js').DrawingContext} drawingContext
     * @param {Vector2} position
     * @param {string} c
     */
    drawChar(drawingContext, position, c) {
        const srcPos = this._src.charPositions.get(c);
        if (!srcPos) {
            return;
        }
        drawingContext.canvasContext.drawImage(
            this._src.image.htmlElement,
            srcPos.x,
            srcPos.y,
            this._src.charSize.x,
            this._src.charSize.y,
            position.x,
            position.y + this._yShift,
            this._dstCharSize.x,
            this._dstCharSize.y
        );
    }

    /**
     * @param {import('./drawing_context.js').DrawingContext} drawingContext
     * @param {Vector2} position
     * @param {string} str
     */
    drawString(drawingContext, position, str) {
        let charWidth = this._dstCharSize.x;
        let lineHeight = this._dstCharSize.y;
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
