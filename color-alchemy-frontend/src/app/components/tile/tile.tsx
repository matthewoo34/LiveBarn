'use client'

import styles from '../../page.module.css'
import { useEffect, useState } from 'react'
import { GameData } from '@/model/GameData'
import { TileData } from '@/model/TileData';
import { ClosestColorData } from '@/model/ClosestColorData';

interface tileProps {
    position: { x: number, y: number };
    matrixColor: TileData[][];
    userMoved: number;
    gameData: GameData;
    setMatrixColor: (matrixColor: TileData[][] | undefined) => void;
    initialColor: number[];
    item: any;
    closestColorData: ClosestColorData;
    numOfDefaultSourceColor: number;
}

enum Direction {
    TOP = 0,
    RIGHT = 1,
    BOTTOM = 2,
    LEFT = 3,
}

enum ColorCode {
    RED = 0,
    GREEN = 1,
    BLUE = 2,
}

export default function Tile(props: tileProps) {
    const { position, matrixColor, userMoved, gameData, setMatrixColor, initialColor, closestColorData, numOfDefaultSourceColor } = props;
    const { width, height } = gameData;

    const [shinedBySource, setShinedBySource] = useState<any[]>([null, null, null, null]);//store all four direction shined info, default null
    const [color, setColor] = useState<number[]>(initialColor); //store the tile color

    useEffect(() => {
        if (position != undefined)
            isMultipleShined(position);
    }, [userMoved])

    useEffect(() => {
        const overallColor = calculateMixedColor(shinedBySource);
        setColor(overallColor);
    }, [shinedBySource])

    useEffect(() => {
        updateMatrixColor({ pos: position, color: color });
    }, [color])

    const calculateMixedColor = (sources: any[]) => {
        let overallColor = [0, 0, 0];
        let normFactor = 0;

        sources.forEach((source, index) => {
            if (source) {
                const result = colorFormula(source, index);
                if (result) {
                    overallColor[ColorCode.RED] += result[ColorCode.RED];
                    overallColor[ColorCode.GREEN] += result[ColorCode.GREEN];
                    overallColor[ColorCode.BLUE] += result[ColorCode.BLUE];
                }
            }
        });

        normFactor = calculateNormFactor(overallColor);

        return overallColor.map((color) => Math.round(color * normFactor));
    };

    const colorFormula = (source: any, index: Direction) => {
        const { color, distance } = source;
        let multiplier = 1;

        if (distance === undefined) {
            return;
        }

        switch (index) {
            case Direction.TOP:
            case Direction.BOTTOM:
                multiplier = (height + 1 - distance) / (height + 1);
                break;
            case Direction.LEFT:
            case Direction.RIGHT:
                multiplier = (width + 1 - distance) / (width + 1);
                break;
            default:
                break;
        }

        return color.map((x: number) => x * multiplier);
    }

    const calculateNormFactor = (overallColor: ColorCode[]) => {
        return 255 / Math.max(overallColor[ColorCode.RED], overallColor[ColorCode.GREEN], overallColor[ColorCode.BLUE], 255);
    }

    const isMultipleShined = (tile: { x: number, y: number }) => {
        let temp = [...shinedBySource];
        let matrix = matrixColor;
        let { x, y } = position;
        let topSource = matrix[x][0];
        let leftSource = matrix[0][y];
        let rightSource = matrix[matrix.length - 1][y];
        let bottomSource = matrix[x][matrix[0].length - 1];

        if (topSource?.shined) { //the top source of the tile is shined
            temp[Direction.TOP] = { ...topSource, distance: y - 0 }; //need to replace the array content, rather than push, else it will insert unwanted data
        }

        if (leftSource?.shined) {//the left source of the tile is shined
            temp[Direction.LEFT] = { ...leftSource, distance: x - 0 };
        }
        if (rightSource?.shined) {//the right source of the tile is shined
            temp[Direction.RIGHT] = { ...rightSource, distance: (matrix.length - 1) - x };
        }
        if (bottomSource?.shined) {//the bottom source of the tile is shined
            temp[Direction.BOTTOM] = { ...bottomSource, distance: (matrix[0].length) - y };
        }
        setShinedBySource(temp);
    }


    const handleTileDragStart = (event: React.DragEvent<HTMLDivElement>, row: number, col: number) => {
        // Store the dragged tile's color in the data transfer object
        if (userMoved >= numOfDefaultSourceColor) { //disable the drag color before the user select the 3 colors
            const tileColor = matrixColor[row][col].color;
            event.dataTransfer.setData('text/plain', JSON.stringify(tileColor));
        }
    };

    const updateMatrixColor = (tileDetail: { pos: { x: number, y: number }, color: number[] }) => {
        const temp = [...matrixColor];
        const updateTile = { ...temp[tileDetail.pos.x][tileDetail.pos.y] }
        updateTile.color = tileDetail.color;
        temp[tileDetail.pos.x][tileDetail.pos.y] = updateTile;
        setMatrixColor(temp);
    }

    return (
        <div
            className={styles.tile + ' ' + styles.tooltip}
            style={{
                backgroundColor: `rgb(${color.toString()})`,
                borderColor: closestColorData.position.x === position.x && closestColorData.position.y === position.y ? 'red' : 'lightgrey'
            }}
            draggable={true}
            onDragStart={(event) => handleTileDragStart(event, position.x, position.y)}
            data-testid={`tile-${position.x}-${position.y}`}
        >
            <span
                className={styles.tooltiptext}>
                {color.toString()}
            </span>
        </div>
    )
}
