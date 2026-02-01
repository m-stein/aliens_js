import { removeItem } from "./array_utilities.js";
import { DrawingContext } from "./drawing_context.js";
import { Vector2 } from "./vector_2.js";

export class GameObject
{
    constructor(position, label)
    {
        this.label = label;
        this.children = [];
        this.position = position;
    }

    removeAllChildren()
    {
        this.children = [];
    }

    addChild(child, index)
    {
        if (typeof index === 'undefined') {
            this.children.push(child);
        } else {
            this.children[index] = child;
        }
    }

    childAt(index)
    {
        return this.children[index];
    }

    removeChild(child)
    {
        removeItem(this.children, child);
    }

    destroyRecursive()
    {
        this.children.forEach((child) => { child.destroy(); });
        this.children.length = 0;
    }

    updateChildren(deltaTimeMs, level)
    {
        this.children.forEach((child) => { child.update(deltaTimeMs, level + 1); });
    }

    drawChildren(drawingContext, level)
    {
        drawingContext.position.add(this.position);
        this.children.forEach((child) => { child.draw(drawingContext, level + 1); });
        drawingContext.position.subtract(this.position);
    }
    
    createAlphaMap(htmlDocument)
    {
        this.alphaMap = htmlDocument.createElement("canvas");
        const offset = new Vector2(
            -this.position.x - this.boundingRect.position.x,
            -this.position.y - this.boundingRect.position.y);

        this.alphaMap.width = this.boundingRect.width;
        this.alphaMap.height = this.boundingRect.height;
        let drawingContext = new DrawingContext(this.alphaMap);
        let context = drawingContext.canvasContext;
        context.save();
        context.translate(offset.x, offset.y);
        this.draw(drawingContext, true);
        context.restore();
        context.globalCompositeOperation = 'source-in';
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, this.alphaMap.width, this.alphaMap.height);
        context.globalCompositeOperation = 'destination-over';
        context.fillStyle = '#000';
        context.fillRect(0, 0, this.alphaMap.width, this.alphaMap.height);
    }

    numChildren() { return this.children.length; }
}