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

    /**
     * 获取指定玩家排名
     * @param uid 
     */
    public async getRankByUid(uid: number) {
        const rankService = new RankService();
        const { rank, score } =  await rankService.getSelfRanking(uid);

        return {
            uid,
            rank,
            score,
        }
    }

    /**
     * 分页查询排行榜信息
     */
    public async getRankList(pageNum: number, pageCount: number) {
        const rankService = new RankService();
        const list = await rankService.getRankingList(pageNum, pageCount, Number.MAX_VALUE);

        return list;
    }

}