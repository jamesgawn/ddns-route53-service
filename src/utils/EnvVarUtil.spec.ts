import { EnvVarUtil } from "./EnvVarUtil";
import Logger from 'bunyan';

describe('EnvVarUtil', () => {
    let envVarHelper: EnvVarUtil;
    const varName: string = 'BLAH_TEST';
    const varValue: string = 'pies';
    afterEach(() => {
        delete process.env[varName];
    });
    beforeEach(() => {
        const logger = Logger.createLogger({
            name: "test"
        });
        envVarHelper = new EnvVarUtil(logger);
    });

    describe('get', () => {
        it('should return config from env var when available', () => {
            process.env[varName] = varValue;
            const result = envVarHelper.get(varName);
            expect(result).toBe(varValue);
        });
        it('should return null when variable isn`t in envVars ', async () => {
            const result = envVarHelper.get(varName);
            expect(result).toBe(null);
        });
    });

    describe('getWithDefault', () => {
        it ('should return the default value if not available in envVar', () => {
            const defaultValue = "defaultValue";
            const value = envVarHelper.getWithDefault(varName, defaultValue);
            expect(value).toBe(defaultValue);
        });
        it ('should return the env var value if available in envVar', () => {
            process.env[varName] = varValue;
            const defaultValue = "defaultValue";
            const value = envVarHelper.getWithDefault(varName, defaultValue);
            expect(value).toBe(varValue);
        });
    });
});
