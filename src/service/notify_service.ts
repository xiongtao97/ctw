import baseConfig from '../config/baseConfig';
import { wsService, BaseController, WsRequestContext } from '../webServer';
import { Logger } from './logger';

const logger = Logger.getServerLog()
export default class NotifyService {
    private static _instance: NotifyService;

    public static get inst() {
        if (!this._instance) {
            this._instance = new this();
        }

        return this._instance;
    }

    public onNotify(uid: number, cmd: string | Function, msg: any) {
        msg.cmd = cmd;
        if (baseConfig.isDev) {
            logger.debug({ type: 'wsPush', msg: JSON.stringify(msg) });
        }

        wsService.sendMsgToUserByUid(uid, msg).catch((err: Error) => {
            logger.error(`notify error. uid:${uid} msg:${err.message}`);
        });
    }

    public register(context: BaseController, uid: number) {
        if (context.requestContext && context.requestContext.constructor == WsRequestContext) {
            const wsContext = context.requestContext as WsRequestContext;
            wsService.recordUid(wsContext.uuid, uid);
        }
    }

    public notifyAll(cmd: string | Function, msg: any) {
        const clients = wsService.getAllClients();
        for (const uuid of clients.keys()) {
            let uid = wsService.getUidByUuid(uuid);
            if (uid) {
                uid = Number(uid);
                this.onNotify(uid, cmd, msg);
            }
        }
    }
}
