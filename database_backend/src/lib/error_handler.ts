import { Request, Response, NextFunction } from "express";
import { ResponseFormat } from "..";
export default (
	err: Error,
	req: Request,
	res: Response,
	//eslint-disable-next-line
	next: NextFunction
) => {
	return res.status(403).json({
		message: err.message,
		status: 403,
		code: "INVALIDREQUEST",
		valid: false,
		data: {
			method: req.method,
			path: req.path,
			error: err,
		},
	} as ResponseFormat);
};
