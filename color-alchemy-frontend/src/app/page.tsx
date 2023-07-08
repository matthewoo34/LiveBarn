'use client'

import Image from 'next/image'
import styles from './page.module.css'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { GameData } from '@/model/GameData'

export default function Home() {
	const initialColor = [0, 0, 0];//black color is the inital color for all tile and circle
	const numOfSourceRow = 2;
	const numOfSourceColumn = 2;
	const winCondition = 10;
	const [gameData, setGameData] = useState(new GameData)
	const [userMoved, setUserMoved] = useState(0);
	const [matrixColor, setMatrixColor] = useState();
	const [closestColorData, setClosestColorData] = useState({ percentage: 100, color: initialColor });
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
	}, [matrixColor, gameData, sourcesNum])

	useEffect(() => { //end game logic
		if (userMoved >= gameData.maxMoves || userHasWin) {
			setShouldEndGame(true);
		} else {
			setShouldEndGame(false);
		}
	}, [userMoved, gameData])

	useEffect(() => {
		if (closestColorData.percentage < winCondition) {
			setUserHasWin(true);
		} else {
			setUserHasWin(false);
		}
	}, [closestColorData])

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
		let result = closestColorData;
		for (let width = 0; width < matrixColor?.length; width++) {
			for (let height = 0; height < matrixColor[width].length; height++) {
				let tempResult =
					1 / 255 * 1 / Math.sqrt(3) * Math.sqrt(Math.pow((gameData?.target?.[0] - matrixColor[width][height][0]), 2) + Math.pow((gameData?.target?.[1] - matrixColor[width][height][1]), 2) + Math.pow((gameData?.target?.[2] - matrixColor[width][height][2]), 2)); // the delta calculation
				tempResult = tempResult * 100 //convert to percentage
				tempResult = Math.round(tempResult * 100) / 100;//round to 2 dp
				if (tempResult < result.percentage) { //if it is less than the existing result, replace it
					result.percentage = tempResult;
					result.color = matrixColor[width][height];
				}
				console.log(tempResult);

			}
		}

		return setClosestColorData(result);
	}

	const setSources = (sourceIndex: { x: number, y: number }) => {
		if (sourcesNum < 3) {
			let temp = matrixColor;
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
			setMatrixColor(temp);
			setSourcesNum(sourcesNum + 1);
		}
	}

	const tileColorDetermined = () => {

	}

	const isMultipleShined = (tile: { x: number, y: number }) => {
		if (matrixColor[0][y].shined) {

		}
	}

	return (
		<div>
			<h3>RGB Alchemy</h3>
			<button onClick={initGameAPI}>Replay</button>
			<p>User ID: {gameData?.userId}</p>
			<p>Moves left: {gameData?.maxMoves - userMoved}</p>
			<div className={styles.gameDataDynamicRow}>Target color:
				<div className={styles.tile + ' ' + styles.targetTile} style={{
					backgroundColor: `rgb(${gameData?.target?.toString()})`,
				}} />
			</div>
			<p></p>
			<div className={styles.gameDataDynamicRow}>Closest color:
				<div
					className={styles.tile + ' ' + styles.closestTile}
					style={{
						backgroundColor: `rgb(${closestColorData?.color?.toString()})`
					}} />
				Δ = {closestColorData.percentage + '%'}
			</div>
			<p></p>
			<div style={{ flexDirection: 'row', display: 'flex' }}>
				{
					matrixColor?.map((item, index: number) => {
						return (
							<>
								<div>
									{
										item.map((i, index2) => {
											if ((index == 0 && index2 == 0) || (index == matrixColor.length - 1 && index2 == 0) || (index == 0 && index2 == item.length - 1) || (index == matrixColor.length - 1 && index2 == item.length - 1)) {
												return (
													<div className={styles.transparentTile} />)
											} else {
												if (index == 0 || index == matrixColor.length - 1 || index2 == 0 || index2 == item.length - 1) {
													return (
														<div
															draggable="true" onDrag={() => { }}
															onClick={() => setSources({ x: index, y: index2 })}
															className={styles.source}
															style={{
																backgroundColor: `rgb(${i?.color.toString()})`
															}} />
													)
												} else {
													return (
														<div className={styles.tile + ' ' + styles.tooltip} style={{ backgroundColor: `rgb(${i?.color.toString()})` }} >
															<span className={styles.tooltiptext}>{i?.color.toString()}</span>
														</div>
													)
												}
											}
										})
									}
								</div>
							</>
						)
					})
				}
			</div>


		</div>
	)
}
