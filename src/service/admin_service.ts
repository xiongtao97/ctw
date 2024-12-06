import * as proto from '../protocol/admin.proto';
import RankService from './rank_service';

export default class AdminService {
    /**
     * 玩家得分上报
     * @param args 
     * @returns 
     */
    public async reportScore(args: proto.ReportScoreInput) {
        // curl 'http://127.0.0.1:4200/admin?cmd=reportScore&uid=1&score=10'
        const { uid, score } = args;

        const rankService = new RankService();
        const { rank, sumScore } = await rankService.setRankData(uid, score, true);

        const res: proto.ReportScoreOutput = {
            uid,
            rank,
            sumScore: Number(sumScore)
        }

        return res;
    }

}