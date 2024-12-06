const errorInfo = {
    param_error: {
        id: 1001,
        msg: '参数错误',
    },
    ctl_not_found: {
        id: 1002,
        msg: '控制器未找到',
    },
    func_not_found: {
        id: 1003,
        msg: 'cmd未找到'
    },
    task_out_time: {
        id: 1004,
        msg: '任务超时',
    },
    too_many_task: {
        id: 1005,
        msg: '太多任务排队，稍后再试',
    },
    system_err: {
        id: 1006,
        msg: '程序异常',
    },
    kick: {
        id: 1007,
        msg: '被踢下线',
    }
};

export default errorInfo;