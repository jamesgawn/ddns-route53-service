import Logger from 'bunyan';
import express, { Application } from "express";
import addRequestId from "express-request-id";
import { AppUtils } from "./utils/AppUtils";
import { EnvVarUtil } from "./utils/EnvVarUtil";
import * as Home from './controllers/Home';
import { Nic } from './controllers/Nic';

const port = AppUtils.normalisePort(8080);
const version = AppUtils.normaliseVersion("0.0.0");

const logger = Logger.createLogger({
    name: "ddns-service",
    version
});

const app: Application = express();
app.disable('x-powered-by');
app.use(addRequestId());

app.use((request, response, next) => {
    logger.info({msg: 'Got a request from %s for %s', ip: request.ip, path: request.path});
    next();
});

const nic = new Nic(logger);

app.get("/", Home.index);
app.get('/nic/update', nic.update);

app.listen(port, () => {
    logger.info(`ddns route 53 server (v${version}) listening to http://localhost:${port}`);
});

