export class GameData {
    userId: string;
    width: number;
    height: number;
    maxMoves: number;
    target: [number, number, number];

    constructor(c?: { [key: string]: any }) {
        c = c || {};
        this.userId = c.userId || '';
        this.width = c.width || null;
        this.height = c.height || null;
        this.maxMoves = c.maxMoves || null;
        this.target = c.target || null;
    }
}
