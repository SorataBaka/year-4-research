import "./App.css";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import wait from "./lib/wait";
import useWindowSize from "./lib/useWindowSize";
import getCameraPermission from "./lib/getPermission";
const timeSet = 60;
function App() {
	const [displayText, setDisplayText] = useState(
		"こんにちは！ 準備ができたら、下のスタートボタンをクリックしてください。"
	);
	const [inSession, setInSession] = useState(false);
	const [permission, setPermission] = useState(false);
	const [stream, setStream] = useState(null);
	const [backgroundColor, setBackgroundColor] = useState("bg-white");
	const [name, setName] = useState("");
	const [step, setStep] = useState(1);

	const playbackReference = useRef(null);
	const videoRecorder = useRef(null);
	const [width, height] = useWindowSize();

	const triggerDone = async () => {
		setBackgroundColor("bg-green-500");
		await wait(300);
		setBackgroundColor("bg-white");
		await wait(300);
	};
	const startSession = async () => {
		try {
			setInSession(true);
			const recorder = new MediaRecorder(stream, { type: "video/mp4" });
			videoRecorder.current = recorder;
			setDisplayText("いっらしゃい!");
			await wait(2000);

			setDisplayText("テストは間もなく始まります");
			await wait(3000);

			setDisplayText("1分間静止してカメラを見つめてください。");
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
			await wait(timeSet * 1000);
			videoRecorder.current.stop();
			setStep((currentStep) => currentStep + 1);
			triggerDone();

			setDisplayText("じっとしていてくれてありがとう！");
			await wait(3000);

			setDisplayText(
				"次に、YouTube ビデオを 1 分間見てください。 画面から目を離さないでください！"
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
			setDisplayText("動画をご覧いただきありがとうございます!");
			await wait(timeSet * 1000);
			videoRecorder.current.stop();
			setStep((currentStep) => currentStep + 1);
			cookingVideo.close();
			await triggerDone();
			await wait(3000);

			setDisplayText(
				"では、別のビデオをご覧ください。 今回はちょっと面白いかも！ 繰り返しますが、画面から目を離さないでください。"
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
			setDisplayText("ご協力ありがとうございました！ あと数ステップです。");
			await wait((timeSet + 5) * 1000);
			videoRecorder.current.stop();
			setStep((currentStep) => currentStep + 1);
			cleaningVideo.close();
			await triggerDone();
			await wait(3000);

			setDisplayText(
				"さあ、ゲームをしましょう！ 箸を使って豆をお皿に置く小さなゲームが与えられます。 これを1分間行ってください。 時間が終了する前に終了した場合は、プレートの内容を捨てて、最初からやり直すことができます。 停止する場合はお知らせいたします。"
			);
			await wait(10000);
			setDisplayText("準備ができて？");
			await wait(1500);
			setDisplayText("始める！");
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
			await wait(timeSet * 1000);
			videoRecorder.current.stop();
			setStep((currentStep) => currentStep + 1);
			await triggerDone();
			setDisplayText("ミニゲームお疲れ様でした！");
			await wait(2000);

			setDisplayText(
				"もうすぐ終わりです。もっと面白いことを試してみましょう。"
			);
			await wait(2000);
			videoRecorder.current.ondataavailable = (event) => {
				if (typeof event.data === "undefined") return;
				if (event.data.size === 0) return;
				const objectUrl = URL.createObjectURL(event.data);
				const hrefTag = document.createElement("a");
				hrefTag.download = `${name}_mazegame.mp4`;
				hrefTag.href = objectUrl;
				hrefTag.click();
			};
			const mazegame = window.open("https://maze.tianharjuno.com");
			videoRecorder.current.start();
			await wait(timeSet * 1000);
			videoRecorder.current.stop();
			setStep((currentStep) => currentStep + 1);
			setDisplayText("よくやった！");
			mazegame.close();
			await triggerDone();
			await wait(2000);
			setDisplayText("最後はタイピングゲームをしてみましょう。");
			await wait(3000);
			videoRecorder.current.ondataavailable = (event) => {
				if (typeof event.data === "undefined") return;
				if (event.data.size === 0) return;
				const objectUrl = URL.createObjectURL(event.data);
				const hrefTag = document.createElement("a");
				hrefTag.download = `${name}_typinggame.mp4`;
				hrefTag.href = objectUrl;
				hrefTag.click();
			};
			const typinggame = window.open(
				"https://10fastfingers.com/typing-test/japanese"
			);
			videoRecorder.current.start();
			await wait((timeSet + 5) * 1000);
			videoRecorder.current.stop();
			setDisplayText(
				"今回の実験にご協力いただきまして誠にありがとうございました。 楽しい一日をお過ごしください。"
			);
			typinggame.close();
			await triggerDone();
		} catch (e) {
			console.error(e.message);
			toast.error("問題が発生しました!", e.message);
		}
	};

	useEffect(() => {
		if (stream === null) return;
		playbackReference.current.srcObject = stream;
	}, [permission, stream]);
	useEffect(() => {
		document.title = "実験アプリ";
	}, []);

	if (width < 1200 || height < 500) {
		return (
			<div className="App">
				<main className="min-h-screen flex flex-col align-middle justify-center text-center gap-y-5 p-5">
					<h1 className="text-3xl font-bold">窓のサイズが小さすぎる!</h1>
					<h2 className="text-2xl w-1/2 mx-auto">
						このアプリケーションはデスクトップ上でのみ実行されるように設計されています。
					</h2>
				</main>
			</div>
		);
	}
	if (!permission) {
		return (
			<div className="App">
				<main className="min-h-screen flex flex-col align-middle justify-center text-center gap-y-12 p-5">
					<h1 className="text-7xl font-bold">
						カメラの許可を取得しています...
					</h1>
					<h2 className="text-4xl w-1/2 mx-auto">
						このアプリを実行するにはカメラが必要です。
					</h2>
					<button
						onClick={() => {
							getCameraPermission(setPermission, setStream);
						}}
						className="bg-red-500 w-1/2 mx-auto p-3 text-white font-bold rounded-xl text-2xl"
					>
						カメラの許可を取得する
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
					className="h-screen w-1/2 object-cover fixed rounded-r-3xl shadow-2xl"
				></video>
				<div className="h-screen w-1/2 fixed right-0 top-0 p-10 flex flex-col align-middle justify-center gap-10">
					<span className="absolute top-0 right-0 p-10 text-2xl font-bold">
						ステップ: {step}/6
					</span>
					<h1 className="text-5xl font-bold transition-all duration-700">
						{displayText}
					</h1>
					{!inSession && (
						<>
							<input
								type="text"
								placeholder="名前を入力してください"
								className="text-2xl p-3 rounded-xl text-center border-none shadow-xl focus:outline-none text-bold"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
							<button
								onClick={startSession}
								disabled={name === ""}
								className="bg-blue-500 text-white font-bold mx-auto px-10 py-4 rounded-lg text-2xl hover:cursor-pointer active:scale-95 transition-all duration-150 disabled:bg-blue-200 shadow-lg"
							>
								始める
							</button>
						</>
					)}
				</div>
			</main>
		</div>
	);
}

export default App;
