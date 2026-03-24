export {};

declare global {
    interface Ttac {
        userHash: string;
        gameId: string;
    }
    interface HighscoreEntry {
        rank: number;
        score: number;
        userName: string;
    }
    declare const ttac: Ttac;
    declare function logGameStart(userHash: string, gameId: string);
    declare function logGameEnd(userHash: string, gameId: string);
    declare function logScore(userHash: string, gameId: string, points: number);
    declare function requestGameHighscore(
        userHash: string,
        gameId: string,
        callback: (entries: HighscoreEntry[]) => void
    ): void;
}
