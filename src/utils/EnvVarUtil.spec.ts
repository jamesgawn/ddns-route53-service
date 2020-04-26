import { EnvVarUtil } from "./EnvVarUtil";
import Logger from 'bunyan';

describe('EnvVarUtil', () => {
    let envVarHelper: EnvVarUtil;

    beforeEach(() => {
        const logger = Logger.createLogger({
            name: "test"
        });
        envVarHelper = new EnvVarUtil(logger);
    });

    describe('get', () => {
        const varName: string = 'BLAH_TEST';
        const varValue: string = 'pies';
        afterEach(() => {
            delete process.env[varName];
        });
        it('should return config from cache when available', () => {
            process.env[varName] = varValue;
            const result = envVarHelper.get(varName);
            expect(result).toBe(varValue);
            process.env[varName] = varValue + "blah blah";
            const result2 = envVarHelper.get(varName);
            expect(result2).toBe(varValue);
        });
        it('should return config from env var when available', () => {
            process.env[varName] = varValue;
            const result = envVarHelper.get(varName);
            expect(result).toBe(varValue);
        });
        it('should throw error when variable isn`t in envVars and fail on error is not set', async () => {
            let resultError: Error = new Error();
            const expectedError = new Error('Failed to retrieve ' + varName + ' from ENV Vars');
            try {
                envVarHelper.get(varName);
            } catch (err) {
                resultError = err;
            }
            expect(resultError.message).toBe(expectedError.message);
        });
        it('should throw error when variable isn`t in envVars and fail on error is true', async () => {
            let resultError: Error = new Error();
            const expectedError = new Error('Failed to retrieve ' + varName + ' from ENV Vars');
            try {
                envVarHelper.get(varName, true);
            } catch (err) {
                resultError = err;
            }
            expect(resultError.message).toBe(expectedError.message);
        });
        it('should return null when fail on error is fales and env var is not available', () => {
            const result = envVarHelper.get(varName, false);
            expect(result).toBe(null);
        });
    });
});
