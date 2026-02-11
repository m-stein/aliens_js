import { GameObject } from './game_object.js';
import { Rectangle } from './rectangle.js';
import { Vector2 } from './vector_2.js';

export class Sprite extends GameObject {
    /**
     * @param {import('./image_file.js').ImageFile} image
     * @param {import('./vector_2.js').Vector2=} frameSize
     * @param {number=} numColumns
     * @param {number=} numRows
     * @param {number=} atFrameIdx
     * @param {import('./vector_2.js').Vector2} framePadding
     */
    constructor(
        image,
        frameSize = new Vector2(
            image.htmlElement.width,
            image.htmlElement.height
        ),
        numColumns = 1,
        numRows = 1,
        atFrameIdx = 0,
        framePadding = new Vector2(0, 0)
    ) {
        super(new Vector2(0, 0), 'Sprite');
        this._image = image;
        this._frameSize = frameSize;
        this._framePadding = framePadding;
        this._numColumns = numColumns;
        this._numRows = numRows;
        this._atFrameIdx = atFrameIdx;

        /** @type {Map<number, Vector2>} */
        this._frameMap = new Map();
        this._initializeFrameMap();
    }

    _initializeFrameMap() {
        let frameIdx = 0;
        for (let rowIdx = 0; rowIdx < this._numRows; rowIdx++) {
            for (let colIdx = 0; colIdx < this._numColumns; colIdx++) {
                const framePos = new Vector2(
                    colIdx * this._frameSize.x,
                    rowIdx * this._frameSize.y
                );
                this._frameMap.set(frameIdx, framePos);
                frameIdx++;
            }
        }
    }

    /**
     * @returns {number}
     */
    frameWidth() {
        return this._frameSize.x;
    }

    /**
     * @returns {number}
     */
    frameHeight() {
        return this._frameSize.y;
    }

    /**
     * @param {number} index
     */
    goToFrame(index) {
        return (this._atFrameIdx = index);
    }

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        this.updateChildren(elapsedMs);
    }

    /**
     * @param {import('drawing_context.js').DrawingContext} drawingContext
     */
    draw(drawingContext) {
        const frame = this._frameMap.get(this._atFrameIdx);
        if (!frame) {
            console.warn('Warning: Failed to get frame from map');
            return;
        }
        const srcRect = new Rectangle(
            frame,
            this._frameSize.x,
            this._frameSize.y
        );
        const dstRect = new Rectangle(
            new Vector2(
                this.position.x - this._framePadding.x,
                this.position.y - this._framePadding.y
            ),
            this._frameSize.x,
            this._frameSize.y
        );
        drawingContext.drawImage(this._image.htmlElement, srcRect, dstRect);
        this.drawChildren(drawingContext);
    }
}
