/** 公共方法集合 */

import Joi from "joi";
import errorInfo from "./config/errorInfo";

/**
 * 随机指定长度的字符串
 * @param length 
 * @returns 
 */
export function randomString(length: number) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456798';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**校验公共参数 */
export function paramsVerify<protoType>(
    args: protoType,
    schemaMap: Joi.SchemaMap<any>,
    allowUnknown: boolean = false,
    stripUnknown: boolean = true
): { uid?: number; param?: protoType; error?: typeof errorInfo.param_error } {
    // 添加默认参数的选项，除了配置的参数
    Object.assign(schemaMap, {
        uid: Joi.number().integer().positive().max(4294967295).required(),
    });

    const schema = Joi.object(schemaMap);
    // 参数验证
    const result = schema.validate(args, { allowUnknown, stripUnknown });
    if (result.error) {
        return { error: errorInfo.param_error }
    }

    const { uid } = result.value;
    return { uid, param: result.value };
}

/**
 * 
 * @returns 当前时间戳(s)
 */
export function getCurrentTimestamp() {
    return Math.floor(new Date().getTime() / 1000);
}

const RANK_END_TIME = 2524579200; // 2050/1/1 0:0:0
const RANK_SUFFIX = 10 ** 9; //五十年

/** 根据分数计算将要存储到redis的值 */
export function getValueByScore(score: number, endTime: number = RANK_END_TIME) {
    const timeDiff = endTime - getCurrentTimestamp();
    const result = Math.floor(score * RANK_SUFFIX + (timeDiff % RANK_SUFFIX));

    return result;
}

/** 根据redis内的值反推出实际分数 */
export function getScoreByValue(value: number) {
    const score = Math.floor(value / RANK_SUFFIX);
    return score;
}

/** 获取存入数据的时间 */
export function getStampByValue(value: number, endStamp: number = RANK_END_TIME) {
    const score = Math.floor(value % RANK_SUFFIX);
    return (endStamp - score);
}