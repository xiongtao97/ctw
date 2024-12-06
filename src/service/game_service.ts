import * as proto from '../protocol/game.proto';

export default class GameService {
    /**
     * 玩家登录
     * @param args
     */
    public async enter(args: proto.EnterInput) {
        const { uid, token } = args;

        // TODO 通过token校验去对应平台获取uid

        // 检查该uid玩家是否存在

        // 对玩家数据进行一系列处理

        // 生成自己服务维护的gameToken
        const res: proto.EnterOutput = {
            uid: uid || 1,
            gameToken: 'test',
            time: Date.now(),
        }

        return res;
    }

}