export class TileData {
    color: number[];
    shined: boolean;

    constructor(c?: { [key: string]: any }) {
        c = c || {};
        this.color = c.color || [0, 0, 0];
        this.shined = c.shined || false;
    }
}
