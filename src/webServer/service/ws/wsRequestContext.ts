import * as WebSocket from 'ws';
import * as http from 'http';

import { BaseRequestContext } from '../../abstract/baseRequestContext';

import * as wsService from './wsService';

export class WsRequestContext extends BaseRequestContext {
    private _ws: WebSocket;

    private _req: http.IncomingMessage;

    private _uuid: number;

    public get uuid() {
        return this._uuid;
    }

    public get ws(): WebSocket {
        return this._ws;
    }

    public get req(): http.IncomingMessage {
        return this._req;
    }

    public constructor(
        ws: WebSocket,
        req: http.IncomingMessage,
        args: any,
        uuid: number
    ) {
        super(args);
        this._ws = ws;
        this._req = req;
        this._uuid = uuid;
    }

    public get ip(): string {
        let result = '';

        if (this._req) {
            if (this._req.headers['x-real-ip']) {
                return this._req.headers['x-real-ip'] as string;
            }

            const str: string =
                `${this._req.headers['x-forwarded-for']}` || '';
            if (str && str != 'undefined') {
                // eslint-disable-next-line prefer-destructuring
                result = str.split(/\s*,\s*/)[0];
            } else if (this._req.socket.remoteAddress) {
                result = this._req.socket.remoteAddress;
            }
        }
        result = result.replace('::ffff:', '');
        return result;
    }

    public get uid(): string | number {
        return wsService.getUidByUuid(this._uuid) || 0;
    }
}
