import { Vector2 } from "./vector_2.js";

export class Rectangle
{
    constructor(position, width, height)
    {
        this.position = position;
        this.width = width;
        this.height = height;
        this.center = this.position.copy().add(new Vector2(this.width / 2, this.height / 2));
    }

    isInside(position)
    {
        return position.x >= this.position.x &&
               position.x < this.position.x + this.width &&
               position.y >= this.position.y &&
               position.y < this.position.y + this.height;
    }

    copy()
    {
        return new Rectangle(this.position.copy(), this.width, this.height);
    }
}