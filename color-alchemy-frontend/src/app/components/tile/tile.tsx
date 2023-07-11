'use client'

import Image from 'next/image'
import styles from '../../page.module.css'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { GameData } from '@/model/GameData'

interface tileProps {
    position: { x: number, y: number };
    matrixColor: any[][];
    userMoved: number;
    gameData: GameData;
    updateMatrixColor: (tileDetail: { pos: { x: number, y: number }, color: number[] }) => void;
    initialColor: number[];
    item: any;
    closestColorData: any; //need better typing
    onDragStart: () => void;
}

interface tileProps {
    initialColor: number[];
}

export default function Tile(props: tileProps) {
    const [shinedBySource, setShinedBySource] = useState([null, null, null, null]);//store all four direction shined info, default null
    const [color, setColor] = useState(props.initialColor);
    enum direction {
        TOP = 0,
        RIGHT = 1,
        BOTTOM = 2,
        LEFT = 3,
    }

    enum colorCode {
        RED = 0,
        GREEN = 1,
        BLUE = 2,
    }


    useEffect(() => {
        if (props.position != undefined)
            isMultipleShined(props.position);
    }, [props.userMoved])

    useEffect(() => {
        mixingAffectedColor(shinedBySource);
    }, [shinedBySource])

    useEffect(() => {
        props.updateMatrixColor({ pos: props.position, color: color });
    }, [color])

    const mixingAffectedColor = (sources: any[]) => {
        console.log('mixing');

        let allColor = [];
        let overallColor = [0, 0, 0];
        let normFactor = 0;
        sources.forEach((source, index) => {
            allColor.push(tileColorCalculation(source, index));
        });

        for (let index = 0; index < allColor.length; index++) {
            if (allColor[index] !== undefined) {
                overallColor[colorCode.RED] = overallColor[colorCode.RED] + allColor?.[index]?.[colorCode.RED];
                overallColor[colorCode.GREEN] = overallColor[colorCode.GREEN] + allColor?.[index]?.[colorCode.GREEN];
                overallColor[colorCode.BLUE] = overallColor[colorCode.BLUE] + allColor?.[index]?.[colorCode.BLUE];
            }
        }

        normFactor = calculateNormFactor(overallColor);
        for (let index = 0; index < overallColor.length; index++) {
            overallColor[index] = Math.round(overallColor[index] * normFactor);
        }

        setColor(overallColor);
    }

    const tileColorCalculation = (source: any, index: direction) => {
        return colorFormula(props.gameData, source, index);
    }

    const colorFormula = (gameData: GameData, source: any, index: direction) => {
        let multiplier = 1;
        switch (index) {
            case direction.TOP:
            case direction.BOTTOM:
                multiplier = (gameData?.height + 1 - source?.distance) / (gameData?.height + 1)
                break;
            case direction.LEFT:
            case direction.RIGHT:
                multiplier = (gameData?.width + 1 - source?.distance) / (gameData?.width + 1)

                break;
            default:
                break;
        }
        const result = source?.color?.map((x: number) => x * multiplier); //each color times the multipler
        return result;
    }

    const calculateNormFactor = (overallColor: colorCode[]) => {
        return 255 / Math.max(overallColor[colorCode.RED], overallColor[colorCode.GREEN], overallColor[colorCode.BLUE], 255);
    }

    const isMultipleShined = (tile: { x: number, y: number }) => {
        let temp = [...shinedBySource];
        let matrix = props.matrixColor;
        let pos = props.position;
        let topSource = matrix[pos.x][0];
        let leftSource = matrix[0][pos.y];
        let rightSource = matrix[matrix.length - 1][pos.y];
        let bottomSource = matrix[pos.x][matrix[0].length - 1];

        if (topSource?.shined) { //the top source of the tile is shined
            temp[direction.TOP] = { ...topSource, distance: pos.y - 0 }; //need to replace the array content, rather than push, else it will insert unwanted data
        }

        if (leftSource?.shined) {//the left source of the tile is shined
            temp[direction.LEFT] = { ...leftSource, distance: pos.x - 0 };
        }
        if (rightSource?.shined) {//the right source of the tile is shined
            temp[direction.RIGHT] = { ...rightSource, distance: (matrix.length - 1) - pos.x };
        }
        if (bottomSource?.shined) {//the bottom source of the tile is shined
            temp[direction.BOTTOM] = { ...bottomSource, distance: (matrix[0].length) - pos.y };
        }
        setShinedBySource(temp);
    }


    return (
        <div
            className={styles.tile + ' ' + styles.tooltip}
            style={{
                backgroundColor: `rgb(${color.toString()})`,
                borderColor: props.closestColorData.position.x == props.position.x && props.closestColorData.position.y == props.position.y ? 'red' : 'lightgrey'
            }}
            draggable={true}
            onDragStart={props.onDragStart}
        >
            <span
                className={styles.tooltiptext}>
                {color.toString()}
            </span>
        </div>
    )
}
