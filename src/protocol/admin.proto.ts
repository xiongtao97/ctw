import { UserOutput } from "./game.proto";

export interface IAdminController {
    /**上报玩家积分 */
    reportScore(input: ReportScoreInput): Promise<ReportScoreOutput>;
}

export interface ReportScoreInput {
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