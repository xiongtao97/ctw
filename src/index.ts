/**
 * 启动入口
 */

import Redis from 'ioredis';
import baseConfig from './config/baseConfig';
// import * as redisPubAndSub from './redisPubAndSub';
import * as webServer from './webServer'
import * as fs from 'fs';
import * as path from 'path';

const redis = new Redis(baseConfig.redis);

function autoRequire(floderStr: string) {
    const pathStr = path.join(__dirname, '.', floderStr);
    const result = fs.readdirSync(pathStr);
    result.forEach((str) => {
        const extname = path.extname(str);
        if (extname === '.js' || (extname === '.ts' && str.indexOf('.d.ts') == -1)) {
            const ctlPath = path.join(pathStr, str);
            require(ctlPath);
        }
    });
}

async function main() {

    // 加载所有控制器，注册对应的路由控制器
    const floders = ['./controller'];
    floders.forEach((floder) => {
        autoRequire(floder);
    });

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