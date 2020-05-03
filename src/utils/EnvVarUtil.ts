import Logger from 'bunyan';

export class EnvVarUtil {
    log: Logger;

    constructor (log: Logger) {
        this.log = log.child({ module: 'config-helper' });
    }

    get(name: string) {
        const value = process.env[name];
        if (value === undefined || value === "") {
            const err = new Error('Failed to retrieve ' + name + ' from ENV Vars');
            this.log.error({
                err
            }, 'Failed to retrieve ' + name + ' from ENV Vars');
            return null;
        } else {
            this.log.info('Retrieved ' + name + ' from ENV Vars');
            return value;
        }
    }

    getWithDefault(name: string, defaultValue: string) {
        const value = this.get(name);
        if (value === null) {
            this.log.info("Providing default value for " + name);
            return defaultValue;
        }
        else
        {
            return value;
        }
    }
}