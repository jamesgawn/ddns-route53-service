import Logger from 'bunyan';
import express, { Application } from "express";
import { AppUtils } from "./utils/AppUtils";
import {EnvVarUtil} from "./utils/EnvVarUtil";
import * as greenlock from 'greenlock-express';
import * as Home from './controllers/Home';

const port = AppUtils.normalisePort(3000);
const version = AppUtils.normaliseVersion("0.0.0");

const logger = Logger.createLogger({
    name: "ddns-service",
    version
});

const envVarUtil = new EnvVarUtil(logger);
const env = envVarUtil.getWithDefault('ENV', "PROD");
envVarUtil.get('SERVICE_USER');
envVarUtil.get('SERVICE_PASS');
const maintainerEmail = envVarUtil.get('MAINTAINER_EMAIL');

const app: Application = express();
app.use((request, response, next) => {
    logger.info({msg: 'Got a request from %s for %s', ip: request.ip, path: request.path});
    next();
});
app.get("/", Home.index);

if (env === "PROD") {
    greenlock.init({
        packageRoot: "./",
        configDir: "./greenlock.d",
        maintainerEmail,
        packageAgent: "ddns-service/" + version,
        cluster: false
    }).serve(app);
    logger.info(`ddns route 53 server (v${version}) listening`);
}
else
{
    app.listen(port, () => {
        logger.info(`ddns route 53 server (v${version}) listening to http://localhost:${port}`);
    });
}