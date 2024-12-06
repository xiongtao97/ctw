import * as proto from '../protocol/admin.proto';
import { RankChangeMsg } from '../protocol/notify.proto';
import NotifyService from './notify_service';
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

        // 通知玩家
        const msg: RankChangeMsg = {
            uid,
            rank,
            score: Number(sumScore) || 0,
        }
        NotifyService.inst.onNotify(uid, 'rankChange', msg);

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

    /**
     * 查询指定玩家上下10名的排行榜数据
     * @param uid 
     * @param near 
     */
    public async getNearRankList(uid: number, near: number = 2) {
        const rankService = new RankService();

        // 先获取该玩家排名
        let { rank } =  await rankService.getSelfRanking(uid);
        // 要的是下标
        rank -= 1;
        // 再计算获取范围
        const start = Math.max(0, rank - near);
        const end = rank + near;
        const list = await rankService.getRankingList2(start, end);
        return list;
    }

}