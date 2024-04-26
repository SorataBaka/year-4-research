import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import consola from "consola";
import helmet from "helmet";
import bodyParser from "body-parser";

import Logger from "./lib/logger";
import ErrorHandler from "./lib/error_handler";
import BlinkData from "./lib/blink_data";

interface ResponseFormat {
	status: number;
	code: string;
	message: string;
	data: any;
}

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI === undefined)
	throw new Error("MONGO_URI is not provided. Aborting startup");

const app = express();
app.use(express.json());
app.use(Logger);
app.use(helmet());
app.use(bodyParser.json());

app.get(
	"/log/:name",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const write = await BlinkData.create({
				name: req.params.name,
				time: new Date(),
			});
			return res.status(200).json({
				status: 200,
				code: "OK",
				message: "OK",
				data: {
					method: req.method,
					path: req.path,
					metadata: write,
				},
			} as ResponseFormat);
		} catch (e: any) {
			next(e);
		}
	}
);
app.get(
	"/retrieve/:name",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const name: string = req.params.name;
			const logArray = await BlinkData.find({ name }).catch((err) => {
				consola.error(err);
				return null;
			});
			if (logArray === null) throw new Error("Error while retrieving data");
			if (logArray.length === 0) throw new Error("No log is found");
			return res.status(200).json({
				status: 200,
				code: "OK",
				message: "OK",
				data: {
					method: req.method,
					path: req.path,
					metadata: logArray,
				},
			} as ResponseFormat);
		} catch (e: any) {
			next(e);
		}
	}
);
app.delete(
	"/delete/:name",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const name: string = req.params.name;
			const logArray = await BlinkData.deleteMany({ name }).catch((err) => {
				consola.error(err);
				return null;
			});
			if (logArray === null) throw new Error("Error deleting");
			return res.status(200).json({
				status: 200,
				code: "OK",
				message: "OK",
				data: {
					method: req.method,
					path: req.path,
				},
			} as ResponseFormat);
		} catch (e: any) {
			next(e);
		}
	}
);

app.all("/", (req: Request, res: Response, next: NextFunction) => {
	try {
		return res.status(200).json({
			status: 200,
			code: "OK",
			message: "OK",
			data: {
				method: req.method,
				path: req.path,
			},
		} as ResponseFormat);
	} catch (e: any) {
		next(e);
	}
});
app.all("*", (req: Request, res: Response, next: NextFunction) => {
	try {
		return res.status(404).json({
			status: 404,
			code: "NOTFOUND",
			message: "Path not found",
			data: {
				method: req.method,
				path: req.path,
			},
		} as ResponseFormat);
	} catch (e: any) {
		next(e);
	}
});
app.use(ErrorHandler);

mongoose.connection.on("connecting", () => {
	consola.info("Attempting connection to database");
});
mongoose.connection.on("open", () => {
	consola.success("Connected to MongoDB");
});
mongoose.connection.on("disconnected", () => {
	consola.warn("Disconnected from database");
});
mongoose.connection.on("error", (error) => {
	consola.error(error.message);
});

app.listen(PORT, async () => {
	consola.success(`Listening on http://localhost:${PORT}`);
	await mongoose.connect(MONGO_URI);
});

export { ResponseFormat };
