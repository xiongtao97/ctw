import { BaseController, registerContrller, BaseRequestContext } from '../webServer';
import * as proto from '../protocol/admin.proto';
import Joi from 'joi';
import { paramsVerify } from '../commonFun';
import AdminService from '../service/admin_service';

@registerContrller('admin')
export default class AdminCtrProxy extends BaseController implements proto.IAdminController {
    _adminService: AdminService;

    constructor(context?: BaseRequestContext) {
        super(context);
        this._adminService = new AdminService();
    }

    async getRankList(input: proto.GetRankListInput): Promise<proto.GetRankListOutput> {
        let { param, error } = paramsVerify(input, {
            pageNum: Joi.number().positive().required(),
            pageCount: Joi.number().positive().max(100).required(),
        });

        const { pageNum, pageCount } = param;
        if (error) return { error };

        const list = await this._adminService.getRankList(pageNum, pageCount);
        return {
            list
        }
    }

    async getRankByUid(input: proto.GetRankByUidInput): Promise<proto.GetRankByUidOutput> {
        let { uid, error } = paramsVerify(input, {});
        if (error) return { error };

        const res = await this._adminService.getRankByUid(uid);
        return res;
    }

    /**
     * 服务器上报玩家得分
     * @param input 
     * @returns 
     */
    async reportScore(input: proto.ReportScoreInput): Promise<proto.ReportScoreOutput> {
        let { param, error } = paramsVerify(input, {
            score: Joi.number().positive().allow(0).required(),
        });
        if (error) return { error };
        
        const res = await this._adminService.reportScore(param);
        return res;
    }
}
