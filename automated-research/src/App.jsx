import "./App.css";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import wait from "./lib/wait";
import useWindowSize from "./lib/useWindowSize";
import getCameraPermission from "./lib/getPermission";

function App() {
	const [displayText, setDisplayText] = useState(
		"Hello! Once you are ready, please click on the start button below."
	);
	const [inSession, setInSession] = useState(false);
	const [permission, setPermission] = useState(false);
	const [stream, setStream] = useState(null);
	const [backgroundColor, setBackgroundColor] = useState("bg-white");
	const [name, setName] = useState("");

	const playbackReference = useRef(null);
	const videoRecorder = useRef(null);
	const [width, height] = useWindowSize();

	const triggerDone = async () => {
		setBackgroundColor("bg-green-500");
		await wait(1000);
		setBackgroundColor("bg-white");
		await wait(500);
	};
	const startSession = async () => {
		try {
			setInSession(true);
			const recorder = new MediaRecorder(stream, { type: "video/mp4" });
			videoRecorder.current = recorder;
			setDisplayText("Welcome!");
			await wait(2000);

			setDisplayText("The test will begin shortly");
			await wait(3000);

			setDisplayText(
				"Please keep still and stare into the camera for 1 minute."
			);
			videoRecorder.current.ondataavailable = (event) => {
				if (typeof event.data === "undefined") return;
				if (event.data.size === 0) return;
				const objectUrl = URL.createObjectURL(event.data);
				const hrefTag = document.createElement("a");
				hrefTag.download = `${name}_noactivity.mp4`;
				hrefTag.href = objectUrl;
				hrefTag.click();
			};
			videoRecorder.current.start();
			await wait(60 * 1000);
			videoRecorder.current.stop();
			triggerDone();

			setDisplayText("Thank you for staying still! ");
			await wait(2000);

			setDisplayText(
				"Next, we need you to watch a youtube video for a minute. Please don't look away from the screen!"
			);
			await wait(3000);
			videoRecorder.current.ondataavailable = (event) => {
				if (typeof event.data === "undefined") return;
				if (event.data.size === 0) return;
				const objectUrl = URL.createObjectURL(event.data);
				const hrefTag = document.createElement("a");
				hrefTag.download = `${name}_video_1.mp4`;
				hrefTag.href = objectUrl;
				hrefTag.click();
			};
			const cookingVideo = window.open(
				"https://www.youtube.com/watch?v=WtScBbpbWCI&t=325s"
			);
			videoRecorder.current.start();
			setDisplayText("Thank you for watching the video!");
			await wait(60 * 1000);
			videoRecorder.current.stop();
			cookingVideo.close();
			await triggerDone();
			await wait(3000);

			setDisplayText(
				"Now, we need you to watch another video. This time it may be a bit more interesting! Again, please don't look away from the screen!"
			);
			await wait(3000);
			videoRecorder.current.ondataavailable = (event) => {
				if (typeof event.data === "undefined") return;
				if (event.data.size === 0) return;
				const objectUrl = URL.createObjectURL(event.data);
				const hrefTag = document.createElement("a");
				hrefTag.download = `${name}_video_2.mp4`;
				hrefTag.href = objectUrl;
				hrefTag.click();
			};
			const cleaningVideo = window.open(
				"https://www.youtube.com/watch?v=YOOQl0hC18U&t=2188s"
			);
			videoRecorder.current.start();
			setDisplayText(
				"Thank you for the cooperation! Just a few more steps. We thank you for your continuous cooperation."
			);
			await wait(65 * 1000);
			videoRecorder.current.stop();
			cleaningVideo.close();
			await triggerDone();
			await wait(3000);

			setDisplayText(
				"Now, let's play a game! You will be given a small game where you use chopsticks to put the mame on the plate. Please do this for 1 minute. If you finish before the time ends, you can dump the contents of the plate and do it all over again. We will let you know when to stop."
			);
			await wait(5000);
			setDisplayText("Ready?");
			await wait(1500);
			setDisplayText("Begin!");
			videoRecorder.current.ondataavailable = (event) => {
				if (typeof event.data === "undefined") return;
				if (event.data.size === 0) return;
				const objectUrl = URL.createObjectURL(event.data);
				const hrefTag = document.createElement("a");
				hrefTag.download = `${name}_mamegame.mp4`;
				hrefTag.href = objectUrl;
				hrefTag.click();
			};
			videoRecorder.current.start();
			await wait(60 * 1000);
			videoRecorder.current.stop();
			await triggerDone();
			setDisplayText("Thank you and good job!");
			await wait(2000);

			setDisplayText("Now, let's try something more interesting.");
			await wait(2000);
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
						onClick={() => {
							getCameraPermission(setPermission, setStream);
						}}
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
			<main
				className={`min-h-screen flex flex-row align-middle justify-between transition-colors duration-1000 ${backgroundColor}`}
			>
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
						<>
							<input
								type="text"
								placeholder="名前を入力してください"
								className="text-3xl p-3 rounded-xl text-center border-none shadow-inner"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
							<button
								onClick={startSession}
								disabled={name === ""}
								className="bg-blue-500 text-white font-bold mx-auto px-10 py-4 rounded-lg text-2xl hover:cursor-pointer active:scale-95 transition-all duration-150 disabled:bg-blue-200"
							>
								Begin
							</button>
						</>
					)}
				</div>
			</main>
		</div>
	);
}

export default App;
