import { BaseController, registerContrller, BaseRequestContext } from '../webServer';
import * as proto from '../protocol/admin.proto';
import Joi from 'joi';
import { paramsVerify } from '../commonFun';
import AdminService from '../service/admin_service';

@registerContrller('admin')
export default class AdminCtrProxy extends BaseController implements proto.IAdminController {
    constructor(context?: BaseRequestContext) {
        super(context);
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
        
        const adminService = new AdminService();
        const res = await adminService.reportScore(param);
        return res;
    }
}
