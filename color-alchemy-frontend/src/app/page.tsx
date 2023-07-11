'use client'

import Image from 'next/image'
import styles from './page.module.css'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { GameData } from '@/model/GameData'
import Tile from './components/tile/tile'

export default function Home() {
	const numOfSourceRow = 2;
	const numOfSourceColumn = 2;
	const winCondition = 10;
	const initialColor = [0, 0, 0];//black color is the inital color for all tile and circle
	const [gameData, setGameData] = useState(new GameData)
	const [userMoved, setUserMoved] = useState(0);
	const [matrixColor, setMatrixColor] = useState();
	const [closestColorData, setClosestColorData] = useState({ percentage: 100, color: initialColor, position: { x: 1, y: 1 } });
	const [shouldEndGame, setShouldEndGame] = useState(false);
	const [userHasWin, setUserHasWin] = useState(false);
	const [sourcesNum, setSourcesNum] = useState(0);

	useEffect(() => {
		initGameAPI();
	}, [])

	useEffect(() => {
		initMatrixColor(gameData);
	}, [gameData])

	useEffect(() => {
		if (matrixColor != undefined && gameData.target != null)
			calculateClosestColor(matrixColor);
	}, [matrixColor, gameData, sourcesNum, userMoved])

	useEffect(() => { //end game logic
		if (gameData?.maxMoves > 0)
			if (userMoved >= gameData?.maxMoves || userHasWin) {
				setShouldEndGame(true);
				if (!userHasWin) {
					if (confirm('Sorry, you have lost! \nDo you want to play again?') == true) { //dup can make a func
						initGameAPI();
					}
				}
			} else {
				setShouldEndGame(false);
			}
	}, [userMoved, gameData])

	useEffect(() => {
		if (closestColorData.percentage < winCondition && userMoved <= gameData?.maxMoves) {
			setUserHasWin(true);
			if (confirm('Congraulation, you have won! \nDo you want to play again?') == true) { //dup can make a func
				resetAllState();
				initGameAPI();
			}
		} else {
			setUserHasWin(false);
		}
	}, [closestColorData, userMoved])

	const initAPIDecider = (gameData: GameData) => { //need to see whether it is brand new user or existing user
		let initApi = 'http://localhost:9876/init';
		if (gameData.userId != '') {
			return initApi + '/user/' + gameData.userId;
		} else {
			return initApi;
		}
	}

	const initGameAPI = () => { //Requesting the init api from the local server
		axios.get(initAPIDecider(gameData))
			.then(res => {
				const initGameData = res.data;
				setGameData(initGameData);
			})
	}

	const initMatrixColor = (gameData: GameData) => {
		const matrix = new Array(gameData?.width + numOfSourceRow).fill({ color: initialColor, shined: false }).map(() => new Array(gameData?.height + numOfSourceColumn).fill({ color: initialColor, shined: false }));
		setMatrixColor(matrix);
	}

	const calculateClosestColor = (matrixColor: [][]) => {
		let result = { ...closestColorData };
		for (let width = 1; width < matrixColor?.length - 1; width++) { //skip the first and last line, as it is the top and bottom source
			for (let height = matrixColor[width].length - 2; height > 0; height--) {
				//matrixColor[width][height].closest = false;
				let tempResult =
					1 / 255 * 1 / Math.sqrt(3) * Math.sqrt(Math.pow((gameData?.target?.[0] - matrixColor[width][height].color?.[0]), 2) + Math.pow((gameData?.target?.[1] - matrixColor[width][height].color?.[1]), 2) + Math.pow((gameData?.target?.[2] - matrixColor[width][height].color?.[2]), 2)); // the delta calculation
				tempResult = tempResult * 100 //convert to percentage
				tempResult = Math.round(tempResult * 100) / 100;//round to 2 dp

				if (tempResult < result.percentage) { //if it is less than the existing result, replace it
					result.percentage = tempResult;
					result.color = matrixColor[width][height].color;
					result.position = { x: width, y: height };
				}
			}
		}

		return setClosestColorData(result);
	}

	const setSources = (sourceIndex: { x: number, y: number }, color?: number[]) => {
		const temp = [...matrixColor];
		if (sourcesNum < 3) {
			switch (sourcesNum) {
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
		} else {
			const test = { ...temp[sourceIndex.x][sourceIndex.y] }
			test.color = color;
			test.shined = true;
			temp[sourceIndex.x][sourceIndex.y] = test;
		}

		setMatrixColor(temp);
		setSourcesNum(sourcesNum + 1);
		setUserMoved(userMoved + 1);
	}

	const updateMatrixColor = async (tileDetail: { pos: { x: number, y: number }, color: number[] }) => {
		setMatrixColor(prevTiles => {
			// Create a copy of the previous tiles
			const updatedTiles = [...prevTiles];
			const clickedTile = { ...updatedTiles[tileDetail.pos.x][tileDetail.pos.y] };

			// Update the clicked tile's color
			clickedTile.color = tileDetail.color;
			updatedTiles[tileDetail.pos.x][tileDetail.pos.y] = clickedTile;

			return updatedTiles;
		});
	}


	const handleTileDragStart = (row: number, col: number) => {
		// Store the dragged tile's color in the data transfer object
		const tileColor = matrixColor[row][col].color;
		event.dataTransfer.setData('text/plain', JSON.stringify(tileColor));
	};

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

	const resetAllState = () => {
		setGameData(new GameData);
		setUserMoved(0);
		setMatrixColor(undefined);
		setClosestColorData({ percentage: 100, color: initialColor, position: { x: 1, y: 1 } });
		setShouldEndGame(false);
		setUserHasWin(false);
		setSourcesNum(0);
	}

	return (
		<div>
			<h3>RGB Alchemy</h3>
			<p>User ID: {gameData?.userId}</p>
			<p>Moves left: {gameData?.maxMoves - userMoved}</p>
			<div className={styles.gameDataDynamicRow + ' ' + styles.tooltip}>Target color:
				<div className={styles.tile + ' ' + styles.targetTile} style={{
					backgroundColor: `rgb(${gameData?.target?.toString()})`,
				}} >
					<span
						className={styles.tooltiptext}>
						{gameData?.target?.toString()}
					</span>
				</div>
			</div>
			<p></p>
			<div className={styles.gameDataDynamicRow}>Closest color:
				<div
					className={styles.tile + ' ' + styles.closestTile + ' ' + styles.tooltip}
					style={{
						backgroundColor: `rgb(${closestColorData?.color?.toString()})`
					}} >
					<span
						className={styles.tooltiptext}>
						{closestColorData?.color?.toString()}
					</span>
				</div>
				Δ = {closestColorData.percentage + '%'}
			</div>
			<p></p>
			<div style={{ flexDirection: 'row', display: 'flex' }}>
				{
					matrixColor?.map((item, index: number) => {
						return (

							<div
								key={index}>
								{
									item.map((i, index2) => {
										if ((index == 0 && index2 == 0) || (index == matrixColor.length - 1 && index2 == 0) || (index == 0 && index2 == item.length - 1) || (index == matrixColor.length - 1 && index2 == item.length - 1)) {
											return (
												<div
													key={index + index2 + 'tSource'}
													className={styles.transparentTile} />)
										} else {
											if (index == 0 || index == matrixColor.length - 1 || index2 == 0 || index2 == item.length - 1) {
												return (
													<div
														key={index + index2 + 'source'}
														onClick={() => setSources({ x: index, y: index2 })}
														className={styles.source}
														style={{
															backgroundColor: `rgb(${i?.color.toString()})`,
															cursor: sourcesNum < 3 ? 'pointer' : 'auto'
														}}
														onDragOver={handleSourceDragOver}
														onDrop={event => handleSourceDrop(event, index, index2)}
													/>
												)
											} else {
												return (
													<Tile
														key={index + index2 + 'tile'}
														position={{ x: index, y: index2 }}
														matrixColor={matrixColor}
														closestColorData={closestColorData}
														gameData={gameData}
														updateMatrixColor={updateMatrixColor}
														userMoved={userMoved}
														initialColor={initialColor}
														item={i}
														onDragStart={() => handleTileDragStart(index, index2)}
													/>
												)
											}
										}
									})
								}
							</div>

						)
					})
				}
			</div>


		</div>
	)
}
