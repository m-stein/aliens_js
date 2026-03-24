/* global ttac, requestGameHighscore, logGameEnd, logScore, logGameStart */
import { createEnum } from 'jet/enum.js';

export class Server {
    static Type = createEnum({
        LiveServer: 0,
        Ttac: 1,
    });

    /**
     * @param {number} type
     */
    constructor(type) {
        this._type = type;
    }

    logGameEnd() {
        switch (this._type) {
            case Server.Type.LiveServer:
                console.log('Server log: The player finished a game');
                break;
            case Server.Type.Ttac:
                logGameEnd(ttac.userHash, ttac.gameId);
                break;
        }
    }

    /**
     * @param {number} points
     */
    logPlayerScoreChanged(points) {
        switch (this._type) {
            case Server.Type.LiveServer:
                console.log(
                    'Server log: The player´s score is ' + points + ' points'
                );
                break;
            case Server.Type.Ttac:
                logScore(ttac.userHash, ttac.gameId, points);
                break;
        }
    }

    logGameStart() {
        switch (this._type) {
            case Server.Type.LiveServer:
                console.log('Server log: The player started a game');
                break;
            case Server.Type.Ttac:
                logGameStart(ttac.userHash, ttac.gameId);
                break;
        }
    }

    /**
     * @param {(highscore: HighscoreEntry[]) => void} fn
     */
    withHighscore(fn) {
        switch (this._type) {
            case Server.Type.LiveServer:
                fn([]);
                break;
            case Server.Type.Ttac:
                requestGameHighscore(ttac.userHash, ttac.gameId, fn);
                break;
        }
    }
}
