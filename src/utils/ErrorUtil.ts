import * as express from "express";

export const sendError = (res: express.Response, statusCode: number, message: string) => {
    res.status(statusCode);
    res.json({
        code: statusCode,
        message
    });
};