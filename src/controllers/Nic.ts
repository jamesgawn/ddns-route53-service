import * as express from "express";
import { EnvVarUtil } from "../utils/EnvVarUtil";
import { sendError } from "../utils/ErrorUtil";
import Logger from 'bunyan';
import {AppUtils} from "../utils/AppUtils";
import {updateDomainARecord} from "../services/Route53Updater";

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

    update = async (req: express.Request, res: express.Response) => {
        if (!req.headers.authorization || !this.validateAuthentication(req.headers.authorization)) {
            this.logger.warn('Failed update due to invalid authorisation header.');
            sendError(res, 401, "Update failed due to invalid authorisation header.");
        } else if (!req.query.myip || !Nic.validateIpAddress(req.query.myip as string)) {
            this.logger.warn('Failed update due to IP address missing from query parameters.');
            sendError(res, 400, "Failed update due to IP address missing from query parameters.");
        } else if (!req.query.hostname) {
            this.logger.warn('Failed update due to hostname missing from query parameters.');
            sendError(res, 400, "Failed update due to hostname missing from query parameters.");
        }
        else
        {
            const domain = req.query.hostname.toString();
            const ip = req.query.myip.toString();
            this.logger.info('Passed validation checks, moving on to domain update');
            try {
                try {
                    await updateDomainARecord(this.logger, domain, ip);
                    res.status(200);
                    res.json({
                        status: 200,
                        message: `Updated ${domain} A record to ${ip}`
                    });
                } catch (err) {
                    sendError(res, 500, err.message);
                }
            } catch (err) {
                sendError(res, 500, err.message);
            }
        }
    }

    private static validateIpAddress(ip: string) {
        return (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip));
    }

    private validateAuthentication(authorisationHeader: string) {
        const credentials = AppUtils.normaliseAuthorisation(authorisationHeader);
        return credentials.username === this.user && credentials.password === this.pass;
    }
}