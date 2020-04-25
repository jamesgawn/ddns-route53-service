import { AppUtils } from "./apputils";

describe('apputils', () => {
    // tslint:disable-next-line:no-empty
    describe('normaliseport', () => {
        it('should return default if no port specified', () => {
            const port = AppUtils.normalisePort(3000);
            expect(port).toBe(3000);
        });
        it('should return default if no port specified in evn var is not a number', () => {
            process.env.port = "asdfasf";
            const port = AppUtils.normalisePort(4500);
            expect(port).toBe(4500);
        });
        it('should return default if no port specified in evn var is 0', () => {
            process.env.port = "0";
            const port = AppUtils.normalisePort(3000);
            expect(port).toBe(3000);
        });
        it('should return env var specified port if it is a number', () => {
            process.env.port = "4000";
            const port = AppUtils.normalisePort(3000);
            expect(port).toBe(4000);
        });
    });
});