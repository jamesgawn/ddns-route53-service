import * as express from "express";
import { EnvVarUtil } from "../utils/EnvVarUtil";
import Logger from 'bunyan';

export class Nic {
    logger: Logger;
    user: string;
    pass: string;

    constructor(logger: Logger) {
        this.logger = logger.child({
            child: "Nic"
        });
        const envVarUtil = new EnvVarUtil(logger);
        const user = envVarUtil.get('SERVICE_USER');
        const pass = envVarUtil.get('SERVICE_PASS');
        if (user && pass) {
            this.user = user;
            this.pass = pass;
        }
        else
        {
            this.logger.fatal("No service credentials specified in environment variables.");
            throw new Error("No service credentials specified in environment variables.");
        }
    }

    update = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.headers.authorization) {
            res.status(501);
            res.json({
                message: "Endpoint Incomplete"
            });
            next();
        }
        else
        {
            this.logger.warn('Failed update due to no authorisation header.');
            res.status(401);
            next(new Error('Update failed due to missing authorisation header.'));
        }
    }
}