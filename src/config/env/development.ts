import { RedisOptions } from 'ioredis';
import { ENVS_TYPE, IEnvConfig } from '../baseConfig';
import { Configuration } from 'log4js';

export default class DevEnvConfig implements IEnvConfig {
    gameId: number;
    redis: RedisOptions;
    env: string;
    isDev: boolean;
    log4js: Configuration;

    constructor(env: ENVS_TYPE) {
        this.gameId = 111;
        this.env = env;
        this.isDev = true;
        this.redis = {
            port: 6379,
            host: '127.0.0.1',
            // password: '',
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        };
        
        const logType = 'dateFile';
        const logLayout = { type: 'json', separator: '' };
        this.log4js = {
            appenders: {
                'server': {
                    type: logType,
                    filename: './log/server.log',
                    pattern: '.yyyy-MM-dd',
                    alwaysIncludePattern: true,
                    maxLogSize: 104857600,
                    backups: 10,
                    layout: logLayout,
                },
                'error': {
                    type: logType,
                    filename: './log/error.log',
                    pattern: '.yyyy-MM-dd',
                    alwaysIncludePattern: true,
                    maxLogSize: 104857600,
                    backups: 10,
                    layout: logLayout,
                },
            },
            categories: {
                default: { appenders: ['server'], level: 'debug' },
                server: { appenders: ['server'], level: 'debug' },
                error: { appenders: ['error'], level: 'error' },
            },
        };
    }

}
