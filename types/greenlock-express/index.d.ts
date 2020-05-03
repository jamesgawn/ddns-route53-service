declare module 'greenlock-express' {
    import express from "express";
    export interface Options {
        isWorker?: boolean;
        cluster: boolean;
        packageRoot: string;
        configDir: string;
        maintainerEmail: string;
        packageAgent: string;
    }
    export interface Single {
        serve(app: express.Application): void;
    }
    export function init(options: Options) : Single;
}