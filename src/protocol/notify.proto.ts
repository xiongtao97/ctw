export enum NotifyCmd {
    rankChange = 'rankChange',
    beingSurpassed = 'beingSurpassed',
}

export interface INotifyController {
    /**排名变化 */
    rankChange(msg: RankChangeMsg): void

    /**前100名玩家被超越时进行通知 */
    beingSurpassed(msg: BeingSurpassedMsg): void

}

export interface RankChangeMsg {
    uid: number
    rank: number
    score: number
}

export interface BeingSurpassedMsg {
    /** 超越者uid */
    tuid: number
    /** 超越者排名 */
    trank: number
    uid: number
    rank: number
}
