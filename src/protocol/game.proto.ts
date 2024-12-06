import errorInfo from "../config/errorInfo";

export interface IGameController {
    /**玩家登录 */
    enter(input: EnterInput): Promise<EnterOutput>;

    /**心跳协议 */
    alive(input: AliveInput): Promise<AliveOutput>;

    /**断线重连 */
    reconnect(input: ReconnectInput): Promise<ReconnectOutput>;
}

export interface UserInput {
    /**玩家uid */
    uid?: number;
    /**控制器命令 */
    cmd?: string;
    /**本服务的token */
    gameToken?: string
}

export interface UserOutput {
    /**控制器命令 */
    cmd?: string;
    /**错误信息 */
    error?: typeof errorInfo.ctl_not_found
}

/**登录申请 */
export interface EnterInput extends UserInput {
    /**平台校验token */
    token?: string;
}

/**登录返回 */
export interface EnterOutput extends UserOutput {
    /**本服务的token */
    gameToken?: string;
    /**玩家uid */
    uid?: number;
    /**当前时间毫秒 */
    time?: number;
}

export interface AliveInput extends UserInput {

}
export interface AliveOutput extends UserOutput {
    /** 服务器时间ms 前端时间校对 */
    time?: number;
}

export interface ReconnectInput extends UserInput {
}
export interface ReconnectOutput extends UserOutput {
    /** 服务器时间ms 前端时间校对 */
    time?: number;
}
