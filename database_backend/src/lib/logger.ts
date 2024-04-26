import { Request, Response, NextFunction } from "express";
import consola from "consola";
const Logger = async (req: Request, _res: Response, next: NextFunction) => {
	try {
		consola.info(
			`${new Date().toLocaleString("jp-JP")} | ${req.method} ${req.path} | ${
				req.headers["user-agent"]
			}`
		);
		return next();
	} catch (e: any) {
		next(e);
	}
};

export default Logger;
