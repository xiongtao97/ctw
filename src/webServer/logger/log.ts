import * as log4js from 'log4js';

import { getRequestContext } from '../hook/hook';
import { WS_SERVER_INSTANCE_ID } from '../service/ws/wsService';

let _customData: { [key: string]: string | number };

/**
 * 设置自定义额外数据 比如 env
 * @param data
 */
export function setCustomData(data: { [key: string]: string | number }) {
    _customData = data;
}

log4js.addLayout(
    'json',
    (config) =>
        function layout(logEvent) {
            const date = new Date();
            const requestContext = getRequestContext();

            let cmd = '';
            let ctl = '';
            let ip = '';
            let args = '';
            let requestId = '';
            if (requestContext) {
                const { data } = requestContext;
                requestId = requestContext.requestId || '';
                cmd = data && data.cmd ? data.cmd : '';
                ctl = data && data.controller ? data.controller : '';

                ip = data && data.ip ? data.ip : '';

                try {
                    args = '';
                    if (data && data.args) {
                        args = JSON.stringify(data.args);
                    }
                } catch (error) {
                    //pass
                }
            }

            const level = logEvent.level.levelStr;
            const { categoryName } = logEvent;

            const commonData = {
                cmd,
                ctl,
                ip,
                args,
                requestId,
                level,
                categoryName,
            };

            let logObj: any = {};

            if (
                Array.isArray(logEvent.data)
                && logEvent.data.length == 1
                && typeof logEvent.data[0] === 'object'
                && logEvent.data[0] != null
            ) {
                // eslint-disable-next-line prefer-destructuring
                logObj = logEvent.data[0];
            } else {
                logObj = { text: JSON.stringify(logEvent.data) };
            }

            Object.keys(commonData).forEach((key) => {
                // @ts-ignore
                logObj[`@${key}`] = commonData[key];
            });
            logObj['@wsId'] = WS_SERVER_INSTANCE_ID;
            if (_customData) {
                logObj.customData = _customData;
            }
            logObj['@time1'] = Date.now();
            return JSON.stringify(logObj) + config.separator;
        }
);

export function initLog(config: log4js.Configuration) {
    log4js.configure(config);
}

export enum LOG_LEVELS {
    TRACE = 0,
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
    FATAL = 5,
}

export function info(
    data: { [id: string]: any },
    categoryName: string = 'server'
) {
    log(data, LOG_LEVELS.INFO, categoryName);
}

export function debug(
    data: { [id: string]: any },
    categoryName: string = 'server'
) {
    log(data, LOG_LEVELS.DEBUG, categoryName);
}
export function warn(
    data: { [id: string]: any },
    categoryName: string = 'server'
) {
    log(data, LOG_LEVELS.WARN, categoryName);
}

export function error(
    data: { [id: string]: any },
    categoryName: string = 'server'
) {
    log(data, LOG_LEVELS.ERROR, categoryName);
}

export function log(
    data: any,
    level: LOG_LEVELS = LOG_LEVELS.INFO,
    categoryName: string = 'server'
) {
    const logger = log4js.getLogger(categoryName);
    let logFun = logger.info;
    switch (level) {
        case LOG_LEVELS.INFO:
            logFun = logger.info;
            break;
        case LOG_LEVELS.DEBUG:
            logFun = logger.debug;
            break;
        case LOG_LEVELS.WARN:
            logFun = logger.warn;
            break;
        case LOG_LEVELS.ERROR:
            logFun = logger.error;
            break;
        default:
            logFun = logger.info;
            break;
    }
    logFun.apply(logger, [data]);
}
