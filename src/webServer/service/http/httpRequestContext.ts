import * as express from 'express';
import { BaseRequestContext } from '../../abstract/baseRequestContext';

export class HttpRequestContext extends BaseRequestContext {
    private _req: express.Request;

    public get req(): express.Request {
        return this._req;
    }

    private _res: express.Response;

    public get res(): express.Response {
        return this._res;
    }

    public constructor(
        req: express.Request,
        res: express.Response,
        args: any
    ) {
        super(args);
        this._req = req;
        this._res = res;
    }

    public get ip(): string {
        const req = this._req;
        let result = '';
        if (!req) {
            return '';
        }

        if (req.headers && req.headers['x-real-ip']) {
            result = req.headers['x-real-ip'] as string;
        } else if (req.headers && req.headers['x-forwarded-for']) {
            result = req.headers['x-forwarded-for'] as string;
        } else if (req.socket && req.socket.remoteAddress) {
            result = req.socket.remoteAddress;
        }
        result = result.replace('::ffff:', '');
        return result;
    }

    public get uid(): string | number {
        return 0;
    }
}
