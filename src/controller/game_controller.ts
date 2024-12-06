import { BaseController, registerContrller, BaseRequestContext } from '../webServer';
import * as proto from '../protocol/game.proto';
import Joi from 'joi';
import { paramsVerify } from '../commonFun';
import GameService from '../service/game_service';
import NotifyService from '../service/notify_service';

@registerContrller('game')
export default class GameCtrProxy extends BaseController implements proto.IGameController {
    constructor(context?: BaseRequestContext) {
        super(context);
    }

    /**
     * 玩家登录
     * @param input 
     * @returns 
     */
    async enter(input: proto.EnterInput): Promise<proto.EnterOutput> {
        let { param, error } = paramsVerify(input, {
            token: Joi.string(),
        });
        if (error) return { error };
        // { "_C": "game", "cmd": "enter" }
        const gameService = new GameService();
        const res = await gameService.enter(param);

        // 绑定ws链接
        NotifyService.inst.register(this, res.uid);
        return res;
    }

    async alive(input: proto.AliveInput): Promise<proto.AliveOutput> {
        const { uid, param, error } = paramsVerify(input, {
            token: Joi.string(),
        });
        if (error) return { error };
        // TODO 逻辑
        return { time: Date.now() }
    }

    async reconnect(input: proto.ReconnectInput): Promise<proto.ReconnectOutput> {
        const { uid, param, error } = paramsVerify(input, {
            gameToken: Joi.string(),
        });
        if (error) return { error };
        // TODO 逻辑
        NotifyService.inst.register(this, uid);
        return { time: Date.now() }
    }
}
