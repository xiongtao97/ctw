// @ts-nocheck
import * as http from 'http';
import * as WebSocket from 'ws';

import { getSystemConfig } from '../../index';

import * as commonFun from '../../../commonFun';
import { pubMessage, addLinstener } from '../../../redisPubAndSub';
import { WsRequestContext } from './wsRequestContext';
import { dispatch } from '../../route/requestRouter';

export const WS_SERVER_INSTANCE_ID = commonFun.randomString(8);

let counter = 1;
const wsClients = new Map<number, WebSocket>();

const uidToUuidMap = new Map<number | string, number>();

const uuidToUidMap = new Map<number, number | string>();

const kickUuids = new Set<number>();

type LOGIN_MSG = { uid: string | number; uuid: number; wsId: string; recordTime?: number };

let _wsServer: WebSocket.Server;
export function getWsServer() {
    return _wsServer;
}

export function start(server: http.Server) {
    const wsServer = new WebSocket.Server(
        { server, perMessageDeflate: false },
        () => { }
    );
    _wsServer = wsServer;
    wsServer.on('connection', (ws: WebSocket, req) => {
        //const ip = req.socket.remoteAddress;
        const uuid = counter++;
        // 超过3次心跳未回复将主动断开链接
        ws.pingTimes = 0;
        wsClients.set(uuid, ws);
        ws['isAlive'] = true;
        ws.on('pong', () => {
            ws['isAlive'] = true;
            ws.pingTimes = Math.min(0, --ws.pingTimes)
        });
        ws.on('message', (message: WebSocket.Data) => {
            ws['isAlive'] = true;
            const kick = kickUuids.has(uuid);

            const args = incomming(message);
            // 获取控制器名称
            const ctlName = args._C;

            const context = new WsRequestContext(ws, req, args, uuid);
            dispatch(ctlName, args, context, kick).then((result) => {
                ws.send(JSON.stringify(result));
                const uid = uuidToUidMap.get(uuid);

                if (!kick) {
                    recordUidToWsId(uid, WS_SERVER_INSTANCE_ID);
                }
            });

            // // 返回请求结果
            // ws.send('success');
            // const uid = uuidToUidMap.get(uuid);
            // if (!kick) {
            //     recordUidToWsId(uid, WS_SERVER_INSTANCE_ID);
            // }
        });
        ws.on('close', () => {
            const uid = uuidToUidMap.get(uuid);
            wsClients.delete(uuid);
            uuidToUidMap.delete(uuid);

            if (uid && uidToUuidMap.get(uid) == uuid) {
                uidToUuidMap.delete(uid);
            }
        });
        ws.on('error', () => { });
    });

    wsServer.on('error', (err) => {
        console.log(err);
    });

    initLinstners();
}

// 心跳机制
setInterval(() => {
    if (!_wsServer) {
        return;
    }
    _wsServer.clients.forEach((ws) => {
        if (ws.pingTimes >= 3) {
            ws['isAlive'] = false;
            return ws.close();
        }
        ws.ping('ping');
        ws.pingTimes++;
    });
}, 5000);

function initLinstners() {
    addLinstener(getChannelName(WS_SERVER_INSTANCE_ID), (message) => {
        let msgData;
        try {
            msgData = JSON.parse(message);
        } catch (error) {
            return;
        }

        if (!msgData) {
            return;
        }
        const { uid, data } = msgData;

        if (!uid || !data) {
            return;
        }
        const uuid = uidToUuidMap.get(uid);
        if (!uuid) {
            return;
        }
        sendMsgToUserByUuid(uuid, data);
    });

    // 防止同一账号多处登录
    addLinstener(getLoginChannelName(), (message) => {
        let msgData: LOGIN_MSG;
        try {
            msgData = JSON.parse(message);
        } catch (error) {
            return;
        }
        if (!msgData) {
            return;
        }
        const { uid, wsId, uuid, recordTime } = msgData;
        const oldUuid = uidToUuidMap.get(uid);
        if (
            oldUuid &&
            (oldUuid != uuid || WS_SERVER_INSTANCE_ID != wsId)
        ) {
            kickUuids.add(oldUuid);
            sendKickMsg(uuid);
        }
    });
}
/**解析请求 */
function incomming(message: WebSocket.Data): any {
    let data: any = {};
    try {
        data = JSON.parse(message.toString());
    } catch (error) {
        //do
    }

    return data;
}

/**
 *记录uid uuid 的映射关系
 *
 * @export
 * @param {number} uuid
 * @param {(number | string)} uid
 * @returns
 */
export async function recordUid(uuid: number, uid: number | string) {
    const oldUuid = uidToUuidMap.get(uid);
    if (oldUuid && oldUuid != uuid) {
        //清理本实例中的老的连接
        kickUuids.add(oldUuid);
        sendKickMsg(oldUuid);
    }

    const lastUid = uuidToUidMap.get(uuid);
    if (lastUid && lastUid != uid) {
        //清理本连接中的旧的的uid
        uidToUuidMap.delete(lastUid);
    }

    uidToUuidMap.set(uid, uuid);
    uuidToUidMap.set(uuid, uid);
    
    recordUidToWsId(uid, WS_SERVER_INSTANCE_ID);
    const msg: LOGIN_MSG = { uid, uuid, wsId: WS_SERVER_INSTANCE_ID };
    await pubMessage(getLoginChannelName(), JSON.stringify(msg));
}

/**发送被踢消息 */
function sendKickMsg(uuid: number) {
    sendMsgToUserByUuid(uuid, { error: '在其他地方登录，被踢下线' });
}

/**
 *redis中记录uid连接的websocket
 *
 * @param {(number | string)} uid
 * @param {string} wsId
 * @returns
 */
function recordUidToWsId(uid: number | string, wsId: string) {
    const redis = getSystemConfig().cacheRedis;
    const key = getWsInstanceIdKey(uid);
    return redis.setex(key, 60 * 5, WS_SERVER_INSTANCE_ID);
}

/**
 *uid对应的wsId缓存key
 *
 * @param {(number | string)} uid
 * @returns
 */
function getWsInstanceIdKey(uid: number | string) {
    const { gameId } = getSystemConfig();
    return `${gameId}:${uid}:wsInstanceKey`;
}

function getSendContent(data: { [key: string]: any }) {
    return JSON.stringify(data);
}

//获取wsId对应的channelName
function getChannelName(wsId: string) {
    return `channel:${wsId}`;
}

//登录广播channelName
function getLoginChannelName() {
    const { gameId } = getSystemConfig();
    return `${gameId}:userLogin`;
}

/**
 * 通过uid 主动推送数据给客户端
 * 如果不在本实例通过redis通知对应实例的
 * @export
 * @param {number} uid
 * @param {*} data
 * @returns
 */
export async function sendMsgToUserByUid(uid: number, data: any) {
    const uuid = uidToUuidMap.get(uid);
    if (uuid && !kickUuids.has(uuid)) {
        const sendResult = await sendMsgToUserByUuid(uuid, data);
        if (sendResult) {
            return;
        }
    }
    const redis = getSystemConfig().cacheRedis;
    const redisKey = getWsInstanceIdKey(uid);
    const instanceId = await redis.get(redisKey);
    if (!instanceId) {
        return;
    }

    await pubMessage(
        getChannelName(instanceId),
        JSON.stringify({ uid, data })
    );
}

/**
 *通过uuid 推动给客户端数据
 *
 * @param {number} uuid
 * @param {*} data
 * @returns
 */
function sendMsgToUserByUuid(uuid: number, data: { [key: string]: any }) {
    return new Promise((res, rej) => {
        const wsClient = wsClients.get(uuid);
        if (wsClient && wsClient.readyState === WebSocket.OPEN) {
            const sendContent = getSendContent(data);
            wsClient.send(sendContent, (error) => {
                if (error) {
                    return res(false);
                }
                return res(true);
            });
        } else {
            return res(false);
        }
    });
}

export function getUidByUuid(uuid: number) {
    return uuidToUidMap.get(uuid);
}

export function getAllClients() {
    return wsClients;
}
