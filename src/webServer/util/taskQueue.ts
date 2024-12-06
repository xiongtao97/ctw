import errorInfo from '../../config/errorInfo';

const allTasks: Set<Task<any, any>> = new Set();

//每500毫秒检查全局等待执行任务
setInterval(() => {
    const removeTasks: Task<any, any>[] = [];
    const now = Date.now();
    allTasks.forEach((task) => {
        if (task.statu == TASK_STATU.finish) {
            removeTasks.push(task);
            return;
        }
        if (task.expireTime > now) {
            //还没超时
            return;
        }

        //已经超时
        if (task.statu == TASK_STATU.created) {
            task.finsh({ error: errorInfo.task_out_time });
        } else if (task.statu == TASK_STATU.start) {
            task.taskQueue.finishTask(task, {
                error: errorInfo.task_out_time,
            });
        }
    });

    removeTasks.forEach((task) => {
        allTasks.delete(task);
    });
}, 500);

/**
 * 任务队列
 */
export class TaskQueue<TASK_DATA, CONTEXT> {
    private _processFun: (
        task: TASK_DATA,
        context: CONTEXT
    ) => Promise<any>;

    private _tasks: { [id: string]: Task<TASK_DATA, CONTEXT> } = {};

    private _context: CONTEXT;

    private _maxNum: number = 0;

    private _count = 0;

    private _currentTaskId = 0;

    private _taskMaxWaitTime: number = 0;

    /**
     *已经完成任务数量
     *
     * @private
     * @memberof TaskQueue
     */
    private _finishNum = 0;

    /**
     * @param {(task: TASK_DATA, context: CONTEXT) => Promise<any>} processFun 处理任务函数
     * @param {CONTEXT} context 任务上下文
     * @param {number} [maxNum=20] 最多排队任务数量
     * @param {number} [taskMaxWaitTime=3000] 任务最多等待时间单位毫秒
     * @memberof TaskQueue
     */
    public constructor(
        processFun: (task: TASK_DATA, context: CONTEXT) => Promise<any>,
        context: CONTEXT,
        maxNum: number = 20,
        taskMaxWaitTime: number = 3000
    ) {
        this._processFun = processFun;
        this._context = context;
        this._maxNum = maxNum;
        this._taskMaxWaitTime = taskMaxWaitTime;
    }

    public async addTask(data: TASK_DATA): Promise<any> {
        if (this._count - this._finishNum > this._maxNum) {
            return { error: errorInfo.too_many_task };
        }

        return new Promise((res, rej) => {
            const taskId = this._count;
            const task = new Task(
                data,
                taskId,
                this,
                (result) => {
                    res(result);
                },
                Date.now() + this._taskMaxWaitTime
            );
            allTasks.add(task);
            this._count++;
            this._tasks[taskId] = task;
            this.checkTask();
        });
    }

    public get leftTaskNum() {
        return this._count - this._finishNum;
    }

    private async checkTask() {
        const task = this._tasks[this._currentTaskId];
        if (!task) {
            return;
        }

        if (task.statu == TASK_STATU.finish) {
            delete this._tasks[this._currentTaskId];
            this._currentTaskId++;
            this._finishNum++;
            this.checkTask();
            allTasks.delete(task);
            return;
        }

        if (task.statu == TASK_STATU.start) {
            return;
        }

        if (task.statu == TASK_STATU.created) {
            task.statu = TASK_STATU.start;
            this._processFun(task.data, this._context)
                .then((result) => {
                    this.finishTask(task, result);
                })
                .catch((error) => {
                    this.finishTask(task, { error });
                });
        }
    }

    public finishTask(task: Task<TASK_DATA, CONTEXT>, result: any) {
        task.finsh(result);
        this.checkTask();
    }
}

enum TASK_STATU {
    created = 1,
    start = 2,
    finish = 3,
}
class Task<TASK_DATA, CONTEXT> {
    private _id: number;

    public get id(): number {
        return this._id;
    }

    private _data: TASK_DATA;

    public get data(): TASK_DATA {
        return this._data;
    }

    private _statu: TASK_STATU = TASK_STATU.created;

    public set statu(value: TASK_STATU) {
        this._statu = value;
    }

    public get statu(): TASK_STATU {
        return this._statu;
    }

    private _taskQueue: TaskQueue<TASK_DATA, CONTEXT>;

    public get taskQueue(): TaskQueue<TASK_DATA, CONTEXT> {
        return this._taskQueue;
    }

    private _expireTime: number = 0;

    public get expireTime(): number {
        return this._expireTime;
    }

    private _cb: (result: any) => void;

    private _addTime: number = 0;

    public get addTime(): number {
        return this._addTime;
    }

    public constructor(
        data: TASK_DATA,
        id: number,
        queue: TaskQueue<TASK_DATA, CONTEXT>,
        cb: (result: any) => void,
        expireTime: number
    ) {
        this._data = data;
        this._id = id;
        this._taskQueue = queue;
        this._cb = cb;
        this._expireTime = expireTime;
        this._addTime = Date.now();
    }

    public finsh(result: any) {
        if (this._statu == TASK_STATU.finish) {
            return;
        }
        this._statu = TASK_STATU.finish;
        this._cb(result);
    }
}
