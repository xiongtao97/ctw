import { RedisOptions } from 'ioredis';
import DevEnvConfig from './env/development';
import { Configuration } from 'log4js';

export const enum ENVS_TYPE {
    //本地开发测试环境
    DEVELOPMENT = 'development',
    //正式环境
    PRODUCTION = 'production',
}

export interface IEnvConfig {
    /**游戏ID*/
    gameId: number;
    /**全局数据库配置，轻量级非玩家数据*/
    redis: RedisOptions;
    /**环境*/
    env: string;
    /**是否是测试环境*/
    isDev: boolean;
    /**log4js配置 */
    log4js: Configuration;
}

const env = process.env.PROJECT_ENV || ENVS_TYPE.DEVELOPMENT;

let envConfig: IEnvConfig = null;
// 用来区分开发和生产环境配置
switch (env) {
    case ENVS_TYPE.DEVELOPMENT: {
        envConfig = new DevEnvConfig(env);
        break;
    }
    case ENVS_TYPE.PRODUCTION: {
        // TODO 生产环境配置
        envConfig = new DevEnvConfig(env);
        break;
    }
    default:
        throw new Error('unknow env.');
}

const baseConfig = envConfig;
export default baseConfig;
