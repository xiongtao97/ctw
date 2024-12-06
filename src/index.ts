/**
 * 启动入口
 */

import Redis from 'ioredis';
import baseConfig from './config/baseConfig';
// import * as redisPubAndSub from './redisPubAndSub';
import * as webServer from './webServer'

const redis = new Redis(baseConfig.redis);

async function main() {
    webServer.init(
        4200,
        baseConfig.gameId,
        redis,
        baseConfig.redis
    );


    // // 测试redis订阅系统
    // redisPubAndSub.init(baseConfig.redis)
    // redisPubAndSub.addLinstener('test', (message) => {
    //     let msgData;
    //     try {
    //         msgData = JSON.parse(message);
    //     } catch (error) {
    //         return;
    //     }
    //     console.log(message)
    // });
    // setTimeout(async () => {
    //     await redisPubAndSub.pubMessage('test', JSON.stringify({ cmd: 'test' }));
    // }, 2000)
}

main()