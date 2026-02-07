export class Char {
    /**
     * @param {string} start
     * @param {string} end
     * @returns {string[]}
     */
    static range(start, end) {
        const startCode = start.charCodeAt(0);
        const endCode = end.charCodeAt(0);
        const len = endCode - startCode + 1;
        return Array.from({ length: len }, (_, i) =>
            String.fromCharCode(startCode + i)
        );
    }
}
