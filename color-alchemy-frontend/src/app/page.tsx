'use client'

import styles from './page.module.css'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { GameData } from '@/model/GameData'
import Tile from './components/tile/tile'
import Source from './components/source/source'
import { TileData } from '@/model/TileData'
import { ClosestColorData } from '@/model/ClosestColorData'
import DisplayTile from './components/displayTile/displayTile'

export default function Game() {
	const numOfSourceRow = 2;
	const numOfSourceColumn = 2;
	const winCondition = 10;
	const initialColor = [0, 0, 0];//black color is the inital color for all tile and circle
	const numOfDefaultSourceColor = 3;

	const [gameData, setGameData] = useState<GameData>(new GameData());
	const [matrixColor, setMatrixColor] = useState<TileData[][] | undefined>();
	const [closestColorData, setClosestColorData] = useState<ClosestColorData>(new ClosestColorData);
	const [userMoved, setUserMoved] = useState(0);
	const [shouldEndGame, setShouldEndGame] = useState(false);
	const [userHasWin, setUserHasWin] = useState(false);
	const { target } = gameData;
	const { color, percentage } = closestColorData;

	//..// Initial API
	const initAPIDecider = (gameData: GameData) => { //need to see whether it is brand new user or existing user
		let initApi = 'http://localhost:9876/init';
		if (gameData.userId != '') {
			return `${initApi}/user/${gameData.userId}`;
		} else {
			return initApi;
		}
	}

	const initGameAPI = () => {//Requesting the init api from the local server
		axios
			.get(initAPIDecider(gameData))
			.then(res => {
				const initGameData = res.data;
				setGameData(initGameData);
			})
			.catch(error => {
				console.log('Error fetching game data:', error);
			});
	};

	useEffect(() => {
		initGameAPI(); //initial point
	}, [])

	//..//

	//..// Initializing matrix color
	const initMatrixColor = useCallback((gameData: GameData) => {
		const matrix = new Array(
			gameData?.width + numOfSourceRow).fill({ color: initialColor, shined: false }).map(() =>
				new Array(gameData?.height + numOfSourceColumn).fill({ color: initialColor, shined: false })
			);
		setMatrixColor(matrix);
	}, [numOfSourceRow, numOfSourceColumn])

	useEffect(() => {
		if (gameData?.userId)
			initMatrixColor(gameData); //rely on gameData to initial the matrix of color
	}, [gameData, initMatrixColor])
	//..//

	//..// calculate the closest color
	const calculateClosestColor = (matrixColor: TileData[][]) => {
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

	useEffect(() => {
		if (matrixColor != undefined && gameData.target != null)
			calculateClosestColor(matrixColor); //calculate the closest, when matrixColor, gameData is present, and on each userMove
	}, [matrixColor, gameData, userMoved])
	//..//


	useEffect(() => { //end game logic
		if (gameData?.userId) // ensure the gameData is loaded, before checking
			setShouldEndGame(userMoved >= gameData?.maxMoves || userHasWin);
	}, [userMoved, gameData, userHasWin])

	useEffect(() => {
		if (closestColorData.percentage < winCondition && userMoved <= gameData?.maxMoves) {
			setUserHasWin(true);
		} else {
			setUserHasWin(false);
		}
	}, [closestColorData, userMoved])



	//..// handle play again
	const resetAllState = () => {
		setGameData(new GameData);
		setUserMoved(0);
		setMatrixColor(undefined);
		setClosestColorData({ percentage: 100, color: initialColor, position: { x: 1, y: 1 } });
		setShouldEndGame(false);
		setUserHasWin(false);
	}

	const handlePlayAgainConfirmation = () => {
		const message = userHasWin ? 'Congraulation, you have won!' : 'Sorry, you have lost!';
		if (window.confirm(`${message}\nDo you want to play again?`)) {
			resetAllState();
			initGameAPI();
		}
	};

	useEffect(() => {
		if (shouldEndGame) {
			handlePlayAgainConfirmation();
		}
	}, [shouldEndGame])
	//..//

	return (
		<div>
			<h3>RGB Alchemy</h3>
			<p>User ID: {gameData?.userId}</p>
			<p>Moves left: {gameData?.maxMoves - userMoved}</p>
			<div
				className={styles.gameDataDynamicRow}>
				Target color:
				<DisplayTile
					testid={"target-color"}
					initialColor={target}
					className={`${styles.tile}  ${styles.targetTile} ${styles.tooltip}`} />
			</div>
			<p></p>
			<div
				className={styles.gameDataDynamicRow}>
				Closest color:
				<DisplayTile
					testid={"closest-color"}
					initialColor={color}
					className={`${styles.tile} ${styles.closestTile} ${styles.tooltip}`} />
				Δ = {percentage + '%'}
			</div>
			<p></p>
			<div className={styles.gamePlate}>
				{
					matrixColor?.map((item, col: number) => {
						return (
							<div
								key={col}>
								{
									item.map((i, row) => {
										if (
											(col == 0 && row == 0) || /* bottom left */
											(col == matrixColor.length - 1 && row == 0) || /* bottom right */
											(col == 0 && row == item.length - 1) ||  /* top left */
											(col == matrixColor.length - 1 && row == item.length - 1)  /* top right */
										) { // show a transparent corner source/tile, to not show a source there
											return (
												<div
													key={col + row + 'tSource'}
													className={styles.transparentTile} />)
										} else {
											if (col === 0 || //first col
												col === matrixColor.length - 1 ||  //last col
												row === 0 || //first row
												row === item.length - 1) { //last row
												return ( //should show the source
													<Source
														key={col + row + 'source'}
														position={{ x: col, y: row }}
														userMoved={userMoved}
														matrixColor={matrixColor}
														setUserMoved={setUserMoved}
														setMatrixColor={setMatrixColor}
														item={i}
														numOfDefaultSourceColor={numOfDefaultSourceColor} />
												)
											} else {
												return (
													<Tile
														key={col + row + 'tile'}
														position={{ x: col, y: row }}
														matrixColor={matrixColor}
														closestColorData={closestColorData}
														gameData={gameData}
														setMatrixColor={setMatrixColor}
														userMoved={userMoved}
														initialColor={initialColor}
														item={i}
														numOfDefaultSourceColor={numOfDefaultSourceColor}
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
