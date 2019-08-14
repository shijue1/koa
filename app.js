const Koa = require("koa");
const Router = require("koa-router");
const path = require("path");
const app = new Koa();
const router = new Router();
const bodyParser = require("koa-bodyparser");
const static = require("koa-static");
var views = require("koa-views");
const session = require('koa-session');
const render = require("koa-art-template");
render(app, {
    root: path.join(__dirname, "views"),
    extname: ".html",
    debug: process.env.NODE_ENV !== "production"
});
// ctx.body 必须赋值内容，否则即便匹配到路由，ctx.status 也会为 404

// 匹配任何路由的应用级中间件：执行任何路由前，都会执行 app.use 里的函数
// 注册了 app.use 中间件，当匹配不到任何路由时，会返回此中间件的结果，可以统一处理 404 的情况。

app.keys = ['some secret hurr'];


app
    .use(async (ctx, next) => {
        ctx.state.userinfo = "张三";
        await next();
        if (ctx.status === 404) {
            ctx.body = "这是一个 404 页面";
            ctx.status = 404;
        }
    })
    // Must be used before any router is used
    .use(views("views", { extension: "ejs" }))
    .use(bodyParser())
    // .use(views('views', { map: {html: 'ejs' }})) //这样配置也可以  注意如果这样配置的话 模板的后缀名是.html
    // .use(static('./static')) // 配置静态web服务的中间件
    .use(static(__dirname + "/static")) // 配置静态web服务的中间件

    // ctx.session.userInfo = 'zhangsan' 后，返回的 cookie 会更新，加上 userInfo = 'zhangsan' 信息
    // 不做 ctx.session.field 不会返回前台 cookie
    .use(session({
        key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
        /** (number || 'session') maxAge in ms (default is 1 days) */
        /** 'session' will result in a cookie that expires when session/browser is closed */
        /** Warning: If a session cookie is stolen, this cookie will never expire */
        maxAge: 86400000,
        autoCommit: true, /** (boolean) automatically commit headers (default true) */
        overwrite: true, /** (boolean) can overwrite or not (default true) */
        httpOnly: true, /** (boolean) httpOnly or not (default true) */
        signed: true, /** (boolean) signed or not (default true) */
        rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
        renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
    }, app))


router.get('/', async (ctx, next) => {
    ctx.response.body = {
        a: 1
    };
});


router
    .get("/login", async ctx => {
        await ctx.render("index", {
            user: {
                name: '张三',
            }
        });
    })
    .get("/a", async ctx => {
        new Buffer(ctx.cookies.get('abc'), 'base64').toString() // 转为utf-8
        ctx.cookies.set('abc', new Buffer('Hello').toString('base64'), { //转为 base64
            httpOnly: true,
        })
        await ctx.render("index");
    })
    .get("/", async ctx => {
        !ctx.session.views && (ctx.session.views = ctx.query.a)

        ctx.cookies.set('userInfo', 'zhangsan', {
            maxAge: 60 * 1000 * 60,
            path: '/news',
        })
        ctx.cookies.get('userInfo')
        // ctx.body = '首页'
        await ctx.render("index", {
            title: "title",
            list: [1, 2, 3],
            content: "<h1>头部</h1>"
        });
    })
    // 路由级中间件
    .get("/news", async (ctx, next) => {
        ctx.session.abc = 1111111
        ctx.session
        ctx.body = "这是一个新闻页面111";
        ctx.cookies.get('userInfo')

        next(); // 不执行 next() 下面的 /news 路由不会被执行
    })
    .get("/news", async ctx => {
        ctx.query; // qs 传值（get 方式）{ a:1, b: 1 }
        ctx.querystring; // qs 传值（get 方式）a=1&b=1
        ctx.request.query;
        ctx.request.querystring;
        ctx.body = "这是一个新闻页面";
    })
    .get("/content/:id/:uid", async ctx => {
        ctx.body = ctx.params; // {id: 1,uid:2}
    })
    .post("/doLogin", async ctx => {
        ctx.body = ctx.request.body;
    });

// 第三方中间件
app
    .use(router.routes()) // 启动路由
    .use(router.allowedMethods())
    .listen(1001);
