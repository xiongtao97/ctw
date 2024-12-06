import { logger } from '../webServer';

export enum LOG_TYPE {
    SERVER = 'server',
    ERROR = 'error',
}

export class Logger {
    private static _instance: Map<LOG_TYPE, Logger> = new Map();

    /**分类名称 */
    private _categoryName: string;

    constructor(type: LOG_TYPE) {
        this._categoryName = type;
    }

    public static getServerLog() {
        return this.getLogger(LOG_TYPE.SERVER);
    }

    public static getErrorLog() {
        return this.getLogger(LOG_TYPE.ERROR);
    }

    public static getLogger(type: LOG_TYPE) {
        let logger = this._instance.get(type);
        if (!logger) {
            logger = new Logger(type);
            this._instance.set(type, logger);
        }
        return logger;
    }

    /**加工日志数据 */
    private getLogExtend(logMsg: string | object) {
        let logData;
        if (typeof logMsg === 'string') {
            logData = { msg: logMsg };
        } else {
            logData = <object>logMsg;
        }
        return logData;
    }

    public error(msg: string | object) {
        const data = this.getLogExtend(msg);
        logger.error(data, this._categoryName);
    }

    public warn(msg: string | object) {
        const data = this.getLogExtend(msg);
        logger.warn(data, this._categoryName);
    }

    public debug(msg: string | object) {
        const data = this.getLogExtend(msg);
        logger.debug(data, this._categoryName);
    }

    public info(msg: string | object) {
        const data = this.getLogExtend(msg);
        logger.info(data, this._categoryName);
    }
}
