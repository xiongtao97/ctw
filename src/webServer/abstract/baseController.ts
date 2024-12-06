import { BaseRequestContext } from './baseRequestContext';

export class BaseController {
    private _requestContext?: BaseRequestContext;

    public get requestContext(): BaseRequestContext | undefined {
        return this._requestContext;
    }

    constructor(context?: BaseRequestContext) {
        if (context) {
            this._requestContext = context;
        }
    }
}
