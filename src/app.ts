import Logger from 'bunyan';
import Koa from 'koa';
import KoaJson from 'koa-json';
import KoaRouter from 'koa-router';
import KoaBodyParser from 'koa-bodyparser';
import { AppUtils } from "./utils/apputils";

const port = AppUtils.normalisePort(3000);
const version = AppUtils.normaliseVersion("0.0.0");

const logger = Logger.createLogger({
    name: "ddns-route53-service",
    version
});

const router = new KoaRouter();

router.get('/', async (ctx, next) => {
    ctx.body = { msg: "Dynamic DNS Service"};
    await next();
});

const koa = new Koa();
koa.use(KoaJson());
koa.use(KoaBodyParser());
koa.use(router.routes()).use(router.allowedMethods());
koa.use( (ctx, next) => {
    logger.info({msg: 'Got a request from %s for %s', ip: ctx.request.ip, path: ctx.path});
    return next();
});

koa.listen(port, () => {
    logger.info(`ddns route 53 server (v${version}) listening to http://localhost:${port}`);
});