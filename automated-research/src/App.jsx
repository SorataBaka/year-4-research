import "./App.css";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { toast } from "react-toastify";
// TODO FIGURE OUT VIDEO RECORDING AND SAVING
function useWindowSize() {
	const [size, setSize] = useState([0, 0]);
	useLayoutEffect(() => {
		function updateSize() {
			setSize([window.innerWidth, window.innerHeight]);
		}
		window.addEventListener("resize", updateSize);
		updateSize();
		return () => window.removeEventListener("resize", updateSize);
	}, []);
	return size;
}

function App() {
	const [permission, setPermission] = useState(false);
	const [stream, setStream] = useState(null);
	const playbackReference = useRef(null);
	const [width, height] = useWindowSize();

	const getCameraPermission = async () => {
		if ("MediaRecorder" in window) {
			try {
				const streamData = await navigator.mediaDevices.getUserMedia({
					audio: false,
					video: true,
				});
				setPermission(true);
				setStream(streamData);
				console.log("Set video stream");
				toast.success("Successfully set camera permissions.");
				return;
			} catch (e) {
				console.error(e);
				toast.error("Insufficient permissions to run this application.");
				return;
			}
		} else {
			toast.error("The MediaRecorder API is not supported in this browser.");
		}
	};

	const openPage = (url) => {
		const videoWindow = window.open(url);
		setTimeout(() => {
			videoWindow.close();
		}, 5000);
	};

	useEffect(() => {
		if (stream === null) return;
		playbackReference.current.srcObject = stream;
	}, [permission, stream]);

	if (width < 1200 || height < 500) {
		return (
			<div className="App">
				<main className="min-h-screen flex flex-col align-middle justify-center text-center gap-y-5 p-5">
					<h1 className="text-3xl font-bold">Window size too small!</h1>
					<h2 className="text-2xl w-1/2 mx-auto">
						This application is designed to run only on desktop.
					</h2>
				</main>
			</div>
		);
	}
	if (!permission) {
		return (
			<div className="App">
				<main className="min-h-screen flex flex-col align-middle justify-center text-center gap-y-5 p-5">
					<h1 className="text-3xl font-bold">Getting camera permissions...</h1>
					<h2 className="text-2xl w-1/2 mx-auto">
						You need a camera to run this app.
					</h2>
					<button
						onClick={getCameraPermission}
						className="bg-red-500 w-full mx-auto p-3 text-white font-bold rounded-md"
					>
						Get camera permission
					</button>
				</main>
			</div>
		);
	}

	return (
		<div className="App">
			<main className="min-h-screen flex flex-row align-middle justify-between">
				<video
					ref={playbackReference}
					autoPlay
					className="h-screen w-1/2 object-cover fixed rounded-r-3xl"
				></video>
				<div className="h-screen w-1/2 fixed right-0 top-0 p-10 flex flex-col align-middle justify-evenly">
					<h1 className="">Hello</h1>
					<button
						onClick={() => {
							openPage("https://youtube.com");
						}}
					>
						`` Test
					</button>
				</div>
			</main>
		</div>
	);
}

export default App;
