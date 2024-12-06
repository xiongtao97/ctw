import * as Redis from 'ioredis';
import * as service from './service';
import * as redisPubAndSub from '../redisPubAndSub';

let systemConfig: {
    // 游戏ID
    gameId: number;
    // 缓存redis
    cacheRedis: Redis.Redis;
};

/**
 *
 * @param port 端口号
 * @param gameId redis缓存 日志 会使用到
 * @param cacheRedis 缓存redis
 * @param pubRedisConfig 订阅通知 redis
 */
function init(
    port: number,
    gameId: number,
    cacheRedis: Redis.Redis,
    pubRedisConfig: Redis.RedisOptions,
) {
    systemConfig = { cacheRedis, gameId };

    if (pubRedisConfig) {
        redisPubAndSub.init(pubRedisConfig);
    }
    if (port > 0) {
        service.start(port);
    }
}

function getSystemConfig() {
    return systemConfig;
}

export {
    init,
    getSystemConfig,
}