export class ClosestColorData {
    percentage: number;
    color: number[];
    position: { x: number, y: number };

    constructor(c?: { [key: string]: any }) {
        c = c || {};
        this.percentage = c.percentage || 100;
        this.color = c.color || [0, 0, 0];
        this.position = c.position || { x: 1, y: 1 };
    }
}
