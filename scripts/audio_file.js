export class AudioFile
{
    constructor(htmlDocument, relPath, onLoaded)
    {
        this.relPath = relPath;
        this.onLoaded = onLoaded;
        this.htmlElement = htmlDocument.createElement("audio");
        this.htmlElement.src = relPath;
        this.htmlElement.addEventListener('canplaythrough', this.onCanPlayThrough);
        this.htmlElement.load();
    }

    onCanPlayThrough = () =>
    {
        this.htmlElement.removeEventListener('canplaythrough', this.onCanPlayThrough);
        this.onLoaded(this);
    }
}