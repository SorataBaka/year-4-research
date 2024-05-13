import { toast } from "react-toastify";
const getCameraPermission = async (setPermission, setStream) => {
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

export default getCameraPermission;
