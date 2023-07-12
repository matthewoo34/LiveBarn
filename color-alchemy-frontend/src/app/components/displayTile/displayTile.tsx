'use client'

import styles from '../../page.module.css'
import { useEffect, useState } from 'react'
import { GameData } from '@/model/GameData'
import { TileData } from '@/model/TileData';
import { ClosestColorData } from '@/model/ClosestColorData';

interface displayTileProps {
    initialColor: number[];
    testid: string;
    className: string;
}

export default function DisplayTile(props: displayTileProps) {
    const { initialColor, testid, className } = props;
    const [color, setColor] = useState<number[]>(initialColor); //store the tile color

    useEffect(() => {
        setColor(initialColor)
    }, [initialColor])

    console.log(color);


    return (
        <div
            className={className}
            style={{
                backgroundColor: `rgb(${color?.toString()})`,
            }}
            data-testid={`${testid}`}
        >
            <span
                className={styles.tooltiptext}>
                {color?.toString()}
            </span>
        </div>
    )
}
