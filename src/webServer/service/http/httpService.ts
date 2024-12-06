import * as http from 'http';
import express from 'express';
import * as bodyParser from 'body-parser';
import * as url from 'url';

const app = express();

/**
 * 创建一个http服务
 * @param port 端口号
 * @param allowCrossdomain 是否允许跨域
 * @returns 
 */
export function start(port: number, allowCrossdomain = true): http.Server {
    app.set('port', port);
    app.use(bodyParser.json({ limit: '5mb' }));
    app.use(bodyParser.urlencoded({ extended: true }));
    if (allowCrossdomain) {
        const allowCrossDomain = (
            req: express.Request,
            res: express.Response,
            next: Function
        ) => {
            const origin = req.headers.origin || '*';
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Allow-Origin', origin);
            res.header(
                'Access-Control-Allow-Methods',
                'GET,PUT,POST,DELETE,OPTIONS'
            );
            res.header(
                'Access-Control-Allow-Headers',
                'Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE'
            );
            res.header('Content-Type', 'application/json;charset=utf-8');
            if (req.method == 'OPTIONS') {
                res.send(200);
            } else {
                next();
            }
        };
        app.use(allowCrossDomain);
    }
    app.use(httpRouter);
    const host = app.get('host');
    // console.log(`http listen on port ${host}:${port}`)
    return http
        .createServer(app)
        .listen(port, host, () => {});
}

/**
 * 路由分发
 * @param req 
 * @param res 
 */
function httpRouter(req: express.Request, res: express.Response) {
    const urlData = url.parse(req.url);

    // 对url进行切割，获取需要访问的控制器和请求参数
    const pathName = urlData.pathname || '';
    const arr = pathName.split(/\/+/);
    let ctlName = ''; // 控制器名称
    if (arr.length > 0) {
        ctlName = arr[arr.length - 1] || arr[arr.length - 2] || '';
    }

    const args: any = {};

    // 获取get请求参数
    if (urlData.query) {
        const querySplits = urlData.query.split('&');
        for (const Key in querySplits) {
            if (querySplits[Key]) {
                const [key, value] = querySplits[Key].split('=');
                args[key] = value;
            }
        }
    }
    // 获取post请求参数
    if (req.body) {
        for (const key in req.body) {
            args[key] = req.body[key];
        }
    }

    ctlName = ctlName || args.ctl || args._c || args.ctlName;
    // TODO 后续处理
    res.send('success!');
}
