import { TileData } from '@/model/TileData';
import styles from '../../page.module.css'

interface SourceProps {
    position: { x: number, y: number };
    userMoved: number;
    matrixColor: TileData[][];
    setUserMoved: (move: number) => void;
    setMatrixColor: (matrixColor: TileData[][] | undefined) => void;
    item: { color: number[], shined: boolean };
    numOfDefaultSourceColor: number;
}


export default function Source(props: SourceProps) {
    const { position, userMoved, matrixColor, setMatrixColor, setUserMoved, item, numOfDefaultSourceColor } = props;
    const handleClickSource = (sourceIndex: { x: number, y: number }) => {
        const temp = [...matrixColor];
        if (userMoved < numOfDefaultSourceColor && temp[sourceIndex.x][sourceIndex.y].shined !== true) { //ensure the player is within the first 3 clicks, and prevent the player from clicking the same source 3 times, which may damage the game flow for the player
            switch (props.userMoved) {
                case 0:
                    temp[sourceIndex.x][sourceIndex.y] = { color: [255, 0, 0], shined: true };
                    break;
                case 1:
                    temp[sourceIndex.x][sourceIndex.y] = { color: [0, 255, 0], shined: true };
                    break;
                case 2:
                    temp[sourceIndex.x][sourceIndex.y] = { color: [0, 0, 255], shined: true };
                    break;
                default:
                    break;
            }
            setMatrixColor(temp);
            setUserMoved(userMoved + 1);
        }
    }

    const handleSourceDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        // Allow dropping on the source
        event.preventDefault();
    };

    const handleSourceDrop = (event: React.DragEvent<HTMLDivElement>, row: number, col: number) => {
        // Get the dragged tile's color from the data transfer object
        const tileColor = JSON.parse(event.dataTransfer.getData('text/plain'));

        // Update the source color with the dragged tile's color
        setSources({ x: row, y: col }, tileColor);
    };

    const setSources = (sourceIndex: { x: number, y: number }, color: number[]) => {
        const temp = [...matrixColor];
        const test = { ...temp[sourceIndex.x][sourceIndex.y] }
        test.color = color;
        test.shined = true;
        temp[sourceIndex.x][sourceIndex.y] = test;
        setMatrixColor(temp);
        setUserMoved(userMoved + 1);
    }

    return (
        <div
            key={position.x + position.y + 'source'}
            onClick={() => handleClickSource({ x: position.x, y: position.y })}
            className={styles.source}
            style={{
                backgroundColor: `rgb(${item?.color.toString()})`,
                cursor: userMoved < numOfDefaultSourceColor ? 'pointer' : 'auto' //change the clickable cursor to normal cursor, once the 3 click of sources are done
            }}
            onDragOver={handleSourceDragOver}
            onDrop={event => handleSourceDrop(event, position.x, position.y)}
            data-testid={`source-${position.x}-${props.position.y}`}
        />
    )
}
