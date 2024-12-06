import { RedisOptions } from 'ioredis';
import { ENVS_TYPE, IEnvConfig } from '../baseConfig';

export default class DevEnvConfig implements IEnvConfig {
    gameId: number;
    redis: RedisOptions;
    env: string;
    isDev: boolean;

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
    }

}
