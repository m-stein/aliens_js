import { createEnum } from "./enum.js";

export class Server
{
    static Type = createEnum({
        LiveServer: 0,
        AdventCalendar: 1,
    });

    constructor(type)
    {
        this.type = type;
    }

    logGameEnd()
    {
        switch(this.type) {
            case Server.Type.LiveServer:
                console.log("Server log: The player finished a game");
                break;
            case Server.Type.AdventCalendar:
                logGameEnd(ttac.userHash, ttac.gameId);
                break;
        }
    }
    
    logPlayerScoreChanged(points)
    {
        switch(this.type) {
            case Server.Type.LiveServer:
                console.log("Server log: The player's score is " + points + " points");
                break;
            case Server.Type.AdventCalendar:
                logScore(ttac.userHash, ttac.gameId, points);
                break;
        }
    }
    
    logGameStart()
    {
        switch(this.type) {
            case Server.Type.LiveServer:
                console.log("Server log: The player started a game");
                break;
            case Server.Type.AdventCalendar:
                logGameStart(ttac.userHash, ttac.gameId);
                break;
        }
    }

    withHighscore(fn)
    {
        switch(this.type) {
            case Server.Type.LiveServer:
                fn([]);
                break;
            case Server.Type.AdventCalendar:
                requestGameHighscore(ttac.userHash, ttac.gameId, fn)
                break;
        }
    }
}