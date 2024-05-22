import "./App.css";
import { FaPlay, FaStop, FaDownload } from "react-icons/fa";
import { toast } from "react-toastify";

import { useEffect, useRef, useState, useCallback } from "react";
function App() {
	const videoReference = useRef(null);
	const [stream, setStream] = useState(null);
	const [recording, setRecording] = useState(null);
	const recorder = useRef(null);
	const [fileName, setFileName] = useState("");
	const [isRecording, setIsRecording] = useState(false);

	const getPermissions = useCallback(async () => {
		const streamData = await navigator.mediaDevices.getUserMedia({
			audio: false,
			video: {
				aspectRatio: 16 / 9,
				autoGainControl: true,
				echoCancellation: true,
				frameRate: 30,
				facingMode: "user",
				noiseSuppression: true,
			},
		});
		setStream(streamData);
		const mediaRecorder = new MediaRecorder(streamData, {
			mimeType: "video/mp4",
		});
		mediaRecorder.ondataavailable = (event) => {
			setRecording(event.data);
			toast.success("Saved Recording");
		};
		recorder.current = mediaRecorder;
	}, []);
	const StartRecording = useCallback(async () => {
		if (recorder.current === null || isRecording) return;
		recorder.current.start();
		setIsRecording(true);
		const content = window.open("https://www.youtube.com/watch?v=ql2oHbGsG1Y");

		await new Promise((resolve) => {
			setTimeout(resolve, 7 * 60 * 1000);
		});

		content.close();
		recorder.current.stop();
		setIsRecording(false);
	}, [isRecording]);
	const StopRecording = useCallback(() => {
		if (recorder.current === null || !isRecording) return;
		recorder.current.stop();

		setIsRecording(false);
	}, [isRecording]);
	const DownloadRecording = useCallback(() => {
		if (recording === null || recorder.current === null || isRecording) return;
		const url = URL.createObjectURL(recording);
		const hrefTag = document.createElement("a");
		hrefTag.href = url;
		hrefTag.download = "test.mp4";
		hrefTag.click();
		hrefTag.remove();
		setRecording(null);
	}, [recording, isRecording]);

	useEffect(() => {
		getPermissions();
	}, [getPermissions]);
	useEffect(() => {
		if (recorder.current === null || videoReference.current === null) return;
		videoReference.current.srcObject = stream;
	}, [videoReference, stream]);

	return (
		<div className="w-screen h-screen overflow-hidden  flex flex-col align-middle justify-center gap-y-5">
			<video
				autoPlay
				ref={videoReference}
				className="w-2/3 mx-auto rounded-3xl shadow-2xl"
			>
				<h1 className="text-center text-2xl font-bold">Loading Video</h1>
			</video>
			<div className="flex flex-row align-middle mx-auto gap-x-16">
				{!isRecording ? (
					<button
						className={
							"rounded-full p-5 shadow-lg transition-all ease-in-out  active:scale-95 bg-blue-300"
						}
						onClick={StartRecording}
					>
						<FaPlay size={30} color="white" className="mx-auto" />
					</button>
				) : (
					<button
						className="bg-red-300 rounded-full p-5 shadow-lg transition-all ease-in-out  active:scale-95"
						onClick={StopRecording}
					>
						<FaStop size={30} color="white" className="mx-auto" />
					</button>
				)}
				<button
					className="bg-blue-300 rounded-full p-5 shadow-lg transition-all ease-in-out  active:scale-95 disabled:bg-blue-100"
					onClick={DownloadRecording}
					disabled={fileName === "" || isRecording || recording === null}
				>
					<FaDownload size={30} color="white" className="mx-auto" />
				</button>
				<input
					type="text"
					placeholder="Name"
					className="shadow-2xl rounded-2xl px-5 text-lg font-bold text-left"
					onChange={(e) => setFileName(e.target.value)}
				/>
			</div>
		</div>
	);
}

export default App;
