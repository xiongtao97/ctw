/**
 * 启动入口
 */

import baseConfig from './config/baseConfig';
import * as redisPubAndSub from './redisPubAndSub';

async function main() {
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