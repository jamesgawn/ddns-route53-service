import Logger from 'bunyan';

export class EnvVarUtil {
    cache: Map<string,string>;
    log: Logger;

    constructor (log: Logger) {
        this.log = log.child({ module: 'config-helper' });
        this.cache = new Map<string, string>();
    }

    get (name: string, errWhenMissing?: boolean) {
        if (this.cache.has(name)) {
            this.log.info('Retrieved ' + name + ' from Cache');
            return this.cache.get(name);
        } else {
            const value = process.env[name];
            if (value === undefined || value === "") {
                if (errWhenMissing || errWhenMissing === undefined) {
                    const err = new Error('Failed to retrieve ' + name + ' from ENV Vars');
                    this.log.error({
                        err
                    }, 'Failed to retrieve ' + name + ' from ENV Vars');
                    throw err;
                } else {
                    this.log.info('Retrieved ' + name + ' from ENV Vars, but it was unavailable');
                    return null;
                }
            } else {
                this.log.info('Retrieved ' + name + ' from ENV Vars');
                this.cache.set(name, value);
                this.log.info('Saved ' + name + ' in Cache');
                return value;
            }
        }
    }

    getWithDefault(name: string, defaultValue: string) {
        const value = this.get(name, false);
        if (value === null) {
            return defaultValue;
        }
        else
        {
            return value;
        }
    }
}