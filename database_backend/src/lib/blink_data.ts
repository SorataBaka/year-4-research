import mongoose from "mongoose";
const Blink = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	time: {
		type: Date,
		required: true,
		default: Date.now(),
	},
});

export default mongoose.model("blink_data", Blink);
