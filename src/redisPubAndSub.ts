/**基于redis 的发布订阅系统 */

import * as Redis from 'ioredis';

const listeners: { [id: string]: Set<(message: string) => {}> } = {};
let pubInstance: Redis.Redis;

let subInstance: Redis.Redis;

const psubscribeChannels: string[] = [];

/**
 *初始化
 *
 * @export
 * @param {Redis.RedisOptions} config
 * @returns
 */
export function init(config: Redis.RedisOptions) {
    if (pubInstance) {
        return;
    }
    pubInstance = new Redis.default(config);
    subInstance = new Redis.default(config);

    subInstance.on('pmessage', (pattern, channel, message) => {
        const set = listeners[channel];

        if (!set) {
            return;
        }
        set.forEach((callback) => {
            try {
                callback(message);
            } catch (error) {}
        });
    });
}

/**
 *增加监听
 *
 * @export
 * @param {string} channel
 * @param {(message: string) => {}} callback
 * @returns
 */
export function addLinstener(channel: string, callback: (message: string) => any) {
    if (!subInstance) return;

    if (psubscribeChannels.indexOf(channel) == -1) {
        subInstance.psubscribe(channel);

        psubscribeChannels.push(channel);
    }

    if (!listeners[channel]) {
        listeners[channel] = new Set<(message: string) => {}>();
    }
    const set = listeners[channel];

    set.add(callback);
}

/**
 * 广播通知
 */
export async function pubMessage(channel: string, message: string) {
    if (!pubInstance) return;
    await pubInstance.publish(channel, message);
}
