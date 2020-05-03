import * as express from "express";
export const index = (req: express.Request, res: express.Response) => {
    res.json({
        message: "Dynamic DNS Service"
    });
};