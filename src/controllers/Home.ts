import * as express from "express";
import {AppUtils} from "../utils/AppUtils";
export const index = (req: express.Request, res: express.Response) => {
    const version = AppUtils.normaliseVersion("0.0.0");
    res.json({
        message: "Dynamic DNS Service",
        version
    });
};