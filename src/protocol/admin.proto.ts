import { IRankItem } from "../service/rank_service";
import { UserInput, UserOutput } from "./game.proto";

export interface IAdminController {
    /**上报玩家积分 */
    reportScore(input: ReportScoreInput): Promise<ReportScoreOutput>;

    /**查询指定玩家排名 */
    getRankByUid(input: GetRankByUidInput): Promise<GetRankByUidOutput>

    /**分页查询排行榜数据 */
    getRankList(input: GetRankListInput): Promise<GetRankListOutput>
}

export interface GetRankListInput extends UserInput {
    /**当前页 */
    pageNum: number
    /**数据条数 */
    pageCount: number
}
export interface GetRankListOutput extends UserOutput  {
    /**排行榜列表 */
    list?: IRankItem[]
}

export interface GetRankByUidInput extends UserInput {
    uid: number
}
export interface GetRankByUidOutput extends UserOutput  {
    uid?: number
    /**当前排名 */
    rank?: number
    /**当前分数 */
    score?: number
}

export interface ReportScoreInput extends UserInput {
    /**玩家uid */
    uid: number;
    /**玩家得分 */
    score: number;
}

export interface ReportScoreOutput extends UserOutput {
    uid?: number;
    /**当前排名 */
    rank?: number;
    /**当前总积分 */
    sumScore?: number;
}