import { Vector2 } from "./vector_2.js";

export class DrawingContext
{
    constructor(canvas)
    {
        this.canvas = canvas;
        this.canvasContext = canvas.getContext("2d");
        this.canvasContext.msImageSmoothingEnabled = false;
        this.canvasContext.mozImageSmoothingEnabled = false;
        this.canvasContext.webkitImageSmoothingEnabled = false;
        this.canvasContext.imageSmoothingEnabled = false;
        this.canvasContext.fillStyle = "white";
        this.position = new Vector2(0, 0);
    }
    
    drawImage(image, srcRect, dstRect)
    {
        this.canvasContext.drawImage(
            image, srcRect.position.x, srcRect.position.y, srcRect.width, srcRect.height,
            this.position.x + dstRect.position.x, this.position.y + dstRect.position.y, dstRect.width, dstRect.height);
    }

    drawText(text, position, size, alignment)
    {
        this.canvasContext.font = size + "px serif";
        this.canvasContext.textAlign = alignment;
        this.canvasContext.fillText(text, this.position.x + position.x, this.position.y + position.y);
    }

    drawRect(rect, color)
    {
        this.canvasContext.fillStyle = color;
        this.canvasContext.fillRect(
            rect.position.x,
            rect.position.y,
            rect.width,
            rect.height
        );
    }
}