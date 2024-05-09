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

const wait = (time) => {
	return new Promise((resolve) => setTimeout(resolve, time));
};

function App() {
	const [displayText, setDisplayText] = useState(
		"Hello! Once you are ready, please click on the start button below."
	);
	const [inSession, setInSession] = useState(false);
	const [permission, setPermission] = useState(false);
	const [stream, setStream] = useState(null);

	const playbackReference = useRef(null);
	const videoRecorder = useRef(null);
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

	const startSession = async () => {
		try {
			setInSession(true);
			setDisplayText("Welcome!");
			await wait(2000);
			setDisplayText("The test will begin shortly");
			await wait(2000);
			const recorder = new MediaRecorder(stream, { type: "video/mp4" });
			videoRecorder.current = recorder;
			videoRecorder.current.start();
			videoRecorder.current.ondataavailable = (event) => {
				if (typeof event.data === "undefined") return;
				if (event.data.size === 0) return;
				const objectUrl = URL.createObjectURL(event.data);
				const hrefTag = document.createElement("a");
				hrefTag.href = objectUrl;
				hrefTag.download = "output.mp4";
				hrefTag.click();
			};
			setDisplayText(
				"Please keep still and stare into the camera for 1 minute."
			);
			await wait(60 * 1000);
			setDisplayText("Thank you for staying still! ");
			await wait(2000);
			setDisplayText(
				"Next, we need you to watch a youtube video for a minute. Please don't look away from the screen!"
			);
			await wait(2000);
			const cookingVideo = window.open(
				"https://www.youtube.com/watch?v=WtScBbpbWCI&t=325s"
			);
			setDisplayText("Thank you for watching the video!");
			await wait(65 * 1000);
			cookingVideo.close();
			await wait(3000);
			setDisplayText(
				"Now, we need you to watch another video. This time it may be a bit more interesting! Again, please don't look away from the screen!"
			);
			await wait(2000);
			const cleaningVideo = window.open(
				"https://www.youtube.com/watch?v=YOOQl0hC18U&t=2188s"
			);
			setDisplayText(
				"Thank you for the cooperation! Just a few more steps. We thank you for your continuous cooperation."
			);
			await wait(65 * 1000);
			cleaningVideo.close();
			await wait(3000);
			setDisplayText(
				"Now, let's play a game! You will be given a small game where you use chopsticks to put the mame on the plate. Please do this for 1 minute. If you finish before the time ends, you can dump the contents of the plate and do it all over again. We will let you know when to stop."
			);
			await wait(5000);
			setDisplayText("Ready?");
			await wait(1000);
			setDisplayText("Begin!");
			await wait(60 * 1000);
			setDisplayText("Thank you for playing! Good job on stacking the nuts.");
			await wait(2000);
			setDisplayText("Now, let's try something more interesting.");
			await wait(2000);

			videoRecorder.current.stop();
		} catch (e) {
			console.error(e.message);
			toast.error("Something went wrong!", e.message);
		}
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
				<div className="h-screen w-1/2 fixed right-0 top-0 p-10 flex flex-col align-middle justify-center gap-5">
					<h1 className="text-3xl font-bold transition-all duration-700">
						{displayText}
					</h1>
					{!inSession && (
						<button
							onClick={startSession}
							className="bg-blue-500 text-white font-bold mx-auto px-10 py-4 rounded-lg text-2xl hover:cursor-pointer active:scale-95 transition-all duration-150"
						>
							Start
						</button>
					)}
				</div>
			</main>
		</div>
	);
}

export default App;
