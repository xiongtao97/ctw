import errorInfo from '../../config/errorInfo';
import { TaskQueue } from '../util/taskQueue';
import { BaseRequestContext } from '../abstract/baseRequestContext';
import { BaseController } from '../abstract/baseController';
import { createRequestContext } from '../hook/hook';

const controllerConfigs: { [id: string]: ControllerConfig } = {};
const queues: {
    [id: string]: { [id: string]: TaskQueue<QUEUE_TASK, QUEUE_CONTEXT> };
} = {};

export enum RequestErrors {
    /**获取队列id出错 */
    getProxyIdError = 1,
    /**程序错误 */
    stackError = 2,
    /**队列处理超时 */
    timeOut = 3,
    /**控制器未找到 */
    ctlNotFound = 4,
    /**函数未找到 */
    funcNotFound = 5,
    /**已被踢下线 */
    kicked = 6,
}

/**
 * 代理队列定义
 */
type ProxyInfo = {
    /**获取请求队列id函数 */
    getProxyIdFun: (
        args: any,
        requestContext: BaseRequestContext
    ) => string | number | Promise<string | number>;

    /**请求队列名 */
    proxyName: string;

    /**请求最大等待时间（毫秒） */
    requestMaxWaitTime?: number;

    /**请求最多等待数量 */
    requestMaxWaitNum?: number;
} | null;

/**
 * 队列任务定义
 */
type QUEUE_TASK = { args: any; controller: BaseController };

/**
 * 队列上下文定义
 */
type QUEUE_CONTEXT = { id: number | string };

/**
 * 控制器信息定义
 */
export type ControllerConfig = {
    controllerName: string;

    ControllerClass: BaseControllerFunction;

    /**队列信息 无则并行执行不走队列 */
    proxyInfo?: ProxyInfo;
};

/**
 * 获取队列代理id 函数定义
 */
export type FunctionGetProxyId = (args: any) => number | Promise<number>;

interface BaseControllerFunction {
    new (context?: BaseRequestContext): BaseController;
}

/**
 *
 * 注册控制器
 * @param {string} controllerName 请求 ctl 名字
 * @param {ProxyInfo} [proxyInfo=null]
 * @returns {(target: BaseControllerFunction) => void}
 */
export function registerContrller(
    controllerName: string,
    proxyInfo: ProxyInfo = null,
): (target: BaseControllerFunction) => void {
    return (target) => {
        controllerConfigs[controllerName] = {
            controllerName,
            ControllerClass: target,
            proxyInfo,
        };
    };
}

/**
 * 请求路由带队列检查
 * @param {string} controllerName
 * @param {*} args
 */
export async function dispatch(
    controllerName: string,
    args: any,
    requestContext?: BaseRequestContext,
    kick = false
): Promise<any> {
    await Promise.resolve();

    createRequestContext(requestContext);
    const startTime = Date.now();

    let result: any;

    if (kick) {
        result = { error: errorInfo.kick };
    } else {
        result = await getRequestResult(
            controllerName,
            args,
            requestContext
        );
    }
    const deltaTime = Date.now() - startTime;
    
    // TODO 替换成log4js
    console.log({
        type: 'requestResult',
        ctlName: controllerName,
        cmd: args.cmd,
        processTime: deltaTime,
        requestResult: JSON.stringify(result),
    })

    if (typeof result === 'object') {
        result.cmd = args.cmd;
        result._C = args._C || '';
    }

    return result;
}

async function getRequestResult(
    controllerName: string,
    args: any,
    requestContext?: BaseRequestContext
): Promise<any> {
    if (!controllerConfigs[controllerName]) {
        return { error: errorInfo.ctl_not_found };
    }
    const cmd = args.cmd || '';

    const { ControllerClass, proxyInfo } = controllerConfigs[controllerName];

    const controller = new ControllerClass(requestContext);

    // @ts-ignore
    if (!controller[cmd] || typeof controller[cmd] !== 'function') {
        return { error: errorInfo.func_not_found };
    }

    if (!proxyInfo) {
        return processRequest(controller, args);
    }
    const { proxyName, getProxyIdFun } = proxyInfo;

    let id;
    try {
        id = await getProxyIdFun(args, requestContext);
    } catch (error) {
        let result;
        if (error) {
            // @ts-ignore
            if (error && error['stack']) {
                console.error({type: 'getProxyIdError', error })
                result = { error: errorInfo.system_err };
            } else {
                result = { error };
            }
            return result;
        }
    }

    if (!queues[proxyName]) {
        queues[proxyName] = {};
    }
    if (!queues[proxyName][id]) {
        queues[proxyName][id] = new TaskQueue(
            async (task: QUEUE_TASK, context: QUEUE_CONTEXT) => {
                const { args, controller } = task;
                const result = await processRequest(controller, args);
                return result;
            },
            { id },
            proxyInfo.requestMaxWaitNum || 20,
            proxyInfo.requestMaxWaitTime || 3000
        );
    }

    const queue = queues[proxyName][id];

    const result = await queue.addTask({
        args,
        controller,
    });

    return result;
}

/**
 *
 *  处理请求
 * @param {BaseController} controller
 * @param {*} args
 * @returns
 */
async function processRequest(controller: BaseController, args: any) {
    // @ts-ignore
    const fun = controller[args.cmd];
    if (!fun) {
        return { error: errorInfo.func_not_found };
    }
    let result;
    try {
        // @ts-ignore
        result = await controller[args.cmd](args);
    } catch (error) {
        // @ts-ignore
        if (error && error['stack']) {
            console.error({
                type: 'processRequestError',
                error,
            });
            result = { error: errorInfo.system_err };
        } else {
            result = { error };
        }
    }

    return result;
}
