import { GameObject } from 'jet/game_object.js';
import { Vector2 } from 'jet/vector_2.js';

export class ContainerObject extends GameObject {

    constructor() {
        super(new Vector2(0, 0), 'ContainerObject');
    }

    /**
     * @param {number} elapsedMs
     */
    update(elapsedMs) {
        this.updateChildren(elapsedMs);
    }

    /**
     * @param {import('jet/drawing_context.js').DrawingContext} drawingContext
     */
    draw(drawingContext) {
        this.drawChildren(drawingContext);
    }
}
