import { useState, useMemo, useEffect, useCallback } from "react";
import { generateMaze } from "./util";
import "./styles.scss";

export default function App() {
	const [gameId, setGameId] = useState(1);
	const [status, setStatus] = useState("playing");
	const size = 20;

	const [userPosition, setUserPosition] = useState([0, 0]);
	//eslint-disable-next-line
	const maze = useMemo(() => generateMaze(size, size), [size, gameId]);

	useEffect(() => {
		const lastRowIndex = maze.length - 1;
		const lastColIndex = maze[0].length - 1;
		if (userPosition[0] === lastRowIndex && userPosition[1] === lastColIndex) {
			setStatus("won");
			handleUpdateSettings();
		}
		//eslint-disable-next-line
	}, [userPosition[0], userPosition[1]]);

	const makeClassName = (i, j) => {
		const rows = maze.length;
		const cols = maze[0].length;
		let arr = [];
		if (maze[i][j][0] === 0) {
			arr.push("topWall");
		}
		if (maze[i][j][1] === 0) {
			arr.push("rightWall");
		}
		if (maze[i][j][2] === 0) {
			arr.push("bottomWall");
		}
		if (maze[i][j][3] === 0) {
			arr.push("leftWall");
		}
		if (i === rows - 1 && j === cols - 1) {
			arr.push("destination");
		}
		if (i === userPosition[0] && j === userPosition[1]) {
			arr.push("currentPosition");
		}
		return arr.join(" ");
	};

	const handleMove = useCallback(
		(e) => {
			e.preventDefault();
			if (status !== "playing") {
				return;
			}
			const key = e.code;

			const [i, j] = userPosition;
			if ((key === "ArrowUp" || key === "KeyW") && maze[i][j][0] === 1) {
				setUserPosition([i - 1, j]);
			}
			if ((key === "ArrowRight" || key === "KeyD") && maze[i][j][1] === 1) {
				setUserPosition([i, j + 1]);
			}
			if ((key === "ArrowDown" || key === "KeyS") && maze[i][j][2] === 1) {
				setUserPosition([i + 1, j]);
			}
			if ((key === "ArrowLeft" || key === "KeyA") && maze[i][j][3] === 1) {
				setUserPosition([i, j - 1]);
			}
		},
		[maze, status, userPosition]
	);
	useEffect(() => {
		document.addEventListener("keypress", handleMove);
		return () => document.removeEventListener("keypress", handleMove);
	}, [handleMove]);
	const handleUpdateSettings = () => {
		setUserPosition([0, 0]);
		setStatus("playing");
		setGameId(gameId + 1);
	};
	return (
		<div className="App" onKeyDown={handleMove} tabIndex={-1}>
			<div className="setting">
				<button onClick={handleUpdateSettings}>
					Restart game with new settings
				</button>
			</div>
			<p>use WSAD or Arrow Keys to move</p>

			<table id="maze" onLoad={(event) => event.target.click()} autoFocus>
				<tbody>
					{maze.map((row, i) => (
						<tr key={`row-${i}`}>
							{row.map((cell, j) => (
								<td key={`cell-${i}-${j}`} className={makeClassName(i, j)}>
									<div />
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>

			{status !== "playing" && (
				<div className="info" onClick={handleUpdateSettings}>
					<p>you won (click here to play again)</p>
				</div>
			)}
		</div>
	);
}
