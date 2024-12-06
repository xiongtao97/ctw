// 用于追踪异步请求上下文

import * as asyncHooks from 'async_hooks';

import { v4 } from 'uuid';

import { BaseRequestContext } from '../abstract/baseRequestContext';

const store = new Map<number, { requestId: string; data: BaseRequestContext | undefined } | undefined>();

const asyncHook = asyncHooks.createHook({
    init: (asyncId, _, triggerAsyncId) => {
        if (store.has(triggerAsyncId)) {
            store.set(asyncId, store.get(triggerAsyncId));
        }
    },
    destroy: (asyncId) => {
        if (store.has(asyncId)) {
            store.delete(asyncId);
        }
    },
});

asyncHook.enable();

const createRequestContext = (data: BaseRequestContext | undefined, requestId = v4()) => {
    const asyncId = asyncHooks.executionAsyncId();
    const requestInfo = { requestId, data, asyncId };
    store.set(asyncId, requestInfo);
    return requestInfo;
};

const getRequestContext = () => store.get(asyncHooks.executionAsyncId());

export { createRequestContext, getRequestContext };
