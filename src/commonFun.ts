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
        uid: Joi.number().integer().positive().max(4294967295),
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