import { Redis } from 'ioredis';
import baseConfig from '../config/baseConfig';
import { getValueByScore, getScoreByValue, getStampByValue, getCurrentTimestamp } from '../commonFun';

const redis = new Redis(baseConfig.redis);

const DAYS_7_SECONDS = 7 * 24 * 60 * 60;

export interface IRankItem {
    /**排名 */
    rank: number;
    /**排名键值,玩家排名时为uid */
    id: string;
    /**分数 */
    score: number;
    /**时间s */
    stamp?: number;
}

export default class RankService {
    private _redis: Redis;

    constructor() {
        this._redis = redis;
    }

    /**
     * 分页获取排行榜数据
     * @param pageNum 当前页，从1开始
     * @param pageCount 每页数量
     * @param total 最大获取排名
     * @param withStamp 携带时间戳
     * @returns
     */
    public async getRankingList(pageNum: number, pageCount: number, total: number, withStamp: number = null): Promise<IRankItem[]> {
        const start = (pageNum - 1) * pageCount + 1;
        const end = start + pageCount - 1;
        if (start > total) return [];
        const redisKey = this.getRedisKey();
        const result = await getRankList(redisKey, start - 1, end - 1, withStamp, ORDER_TYPE.desc);
        return result;
    }

    /**获取指定范围的排行榜信息 */
    public async getRankingList2(start: number, end: number, withStamp: number = null) {
        const redisKey = this.getRedisKey();
        const result = await getRankList(redisKey, start, end, withStamp, ORDER_TYPE.desc);
        return result;
    }

    /**获取自身的排名 分值从大到小 */
    public async getSelfRanking(uid: number) {
        const redisKey = this.getRedisKey();
        const result = await getRank(redisKey, uid);
        return result;
    }

    /**获取排行榜内总数量 */
    public async getRankCount() {
        const redisKey = this.getRedisKey();
        const value = await this._redis.zcard(redisKey);
        return value;
    }

    /**
     * 存入排行榜数据
     * @param value 分数
     * @param expireTime 过期时间 默认7天，0 不过期
     */
    public async setRankData(uid: number, value: number, isAdd: boolean = false, expireTime: number = DAYS_7_SECONDS) {
        const redisKey = this.getRedisKey();
        const score = await addRankScore(redisKey, String(uid), value, expireTime, isAdd);
        const { rank } = await getRank(redisKey, uid);

        return {
            rank,
            sumScore: score,
        }
    }

    /**根据uid删除排名 */
    public async delRankData(uid: number) {
        const redisKey = this.getRedisKey();
        await this._redis.zrem(redisKey, String(uid));
    }

    private getRedisKey() {
        return `${baseConfig.gameId}:rank:sortedSet`;
    }
}

/**************************通用***************************** */

/**排序方式 */
export enum ORDER_TYPE {
    desc = 1,
    asc = 2,
}

/**添加排行榜积分 */
export async function addRankScore(
    rankKey: string,
    id: string,
    score: number,
    expire: number = DAYS_7_SECONDS,
    isAdd: boolean = false,
): Promise<void | number> {
    const pipeline = redis.pipeline();
    if (isAdd) {
        const oldValue = await redis.zscore(rankKey, id);
        score += getScoreByValue(Number(oldValue) || 0);
    }
    const value = getValueByScore(score);
    pipeline.zadd(rankKey, value, id);
    if (expire) pipeline.expire(rankKey, expire);
    await pipeline.exec().catch((error) => {
        console.error(`addRankScore ${rankKey}, ${id}, ${value}`);
    })
    return score
}

/**
 *
 * @param rankListKey
 * @param start 从0开始
 * @param end
 * @param order 排序类型
 */
export async function getRankList(
    rankListKey: string,
    start: number,
    end: number,
    withStamp: number = null,
    order: ORDER_TYPE = ORDER_TYPE.desc
) {
    const fun = order == ORDER_TYPE.desc ? redis.zrevrange : redis.zrange;
    const queryResult: string[] = await fun.apply(redis, [
        rankListKey,
        start,
        end,
        'WITHSCORES',
    ]);

    const result: IRankItem[] = [];
    for (let i = 0; i < queryResult.length; i += 2) {
        const id: string = queryResult[i];
        const value = Number(queryResult[i + 1]);
        const score = getScoreByValue(value);
        const item: IRankItem = {
            id,
            score,
            rank: i / 2 + 1 + start,
        };
        if (withStamp) {
            item.stamp = getStampByValue(value);
        }
        result.push(item);
    }
    return result;
}

export async function getRank(
    rankListKey: string,
    id: string | number,
    order: ORDER_TYPE = ORDER_TYPE.desc
) {
    const fun = order == ORDER_TYPE.desc ? redis.zrevrank : redis.zrank;
    let rank = await fun.apply(redis, [rankListKey, `${id}`]);

    if (rank == null) {
        rank = 0;
    } else {
        rank += 1;
    }
    const value = await redis.zscore(rankListKey, `${id}`);
    let score = 0;
    if (parseInt(value) > 0) {
        score = getScoreByValue(parseInt(value));
    }
    return { rank, score };
}

export async function getRankScore(
    rankListKey: string,
    id: string | number,
) {
    const value = await redis.zscore(rankListKey, `${id}`);
    let score = 0;
    if (parseInt(value) > 0) {
        score = getScoreByValue(parseInt(value));
    }
    return { score };
}

export async function delRank(
    rankListKey: string,
    id: string | number
) {
    await redis.zrem(rankListKey, id);
}

export async function delAllRank(
    rankListKey: string,
) {
    await redis.del(rankListKey);
}
