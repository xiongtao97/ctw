export interface INotifyController {
    /**排名变化 */
    rankChange(msg: RankChangeMsg): void
}

export interface RankChangeMsg {
    uid: number
    rank: number
    score: number
}
