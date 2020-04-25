export class AppUtils {
    static normalisePort(defaultPort: number) {
        const envPort = process.env.port;
        if (envPort === undefined)
        {
            return defaultPort;
        }
        const parsedEnvPort = parseInt(envPort, 10);
        if (isNaN(parsedEnvPort)) {
            return defaultPort;
        }
        if (parsedEnvPort > 0) {
            return parsedEnvPort;
        }
        return defaultPort;
    }
}