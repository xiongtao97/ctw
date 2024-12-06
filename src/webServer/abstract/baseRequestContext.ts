export abstract class BaseRequestContext {
    private _args: any;

    private _data: any;

    public get args(): any {
        return this._args;
    }

    private _startTime: number;

    public get startTime(): number {
        return this._startTime;
    }

    private _endTime: number = 0;

    public get endTime(): number {
        return this._endTime;
    }

    public set endTime(value: number) {
        this._endTime = value;
    }

    public constructor(args: any) {
        this._args = args;
        this._startTime = Date.now();
    }

    public abstract get ip(): string;

    public get cmd(): string {
        return this._args.cmd;
    }

    public get controller(): string {
        const ctlName = this.args._C;

        return ctlName;
    }

    public abstract get uid(): string | number;

    public set customData(data) {
        this._data = data;
    }

    public get customData() {
        return this._data;
    }
}
