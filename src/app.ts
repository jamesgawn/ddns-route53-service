import Logger from 'bunyan';
import Koa from 'koa';
import KoaJson from 'koa-json';
import KoaRouter from 'koa-router';
import { AppUtils } from "./utils/apputils";

const port = AppUtils.normalisePort(3000);

const logger = Logger.createLogger({
    name: "ddns-route53-service"
});

const router = new KoaRouter();

router.get('/', async (ctx, next) => {
    ctx.body = { msg: "Hello World"};
    await next();
});

const koa = new Koa();
koa.use(KoaJson());
koa.use(router.routes()).use(router.allowedMethods());

koa.listen(port, () => {
    logger.info(`server listening to http://localhost:${port}`);
});