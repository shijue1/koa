const Koa = require("koa"),
  Router = require("koa-router"),
  router = new Router(),
  app = new Koa(),
  db = require("./libs/mongodb"),
  admin = require('./routes/admin'),
  index = require('./routes/index')

app.use(async (ctx, next) => {
  await next();
});

router.use("/admin", admin);
router.use(index)

// 第三方中间件
app
  .use(router.routes()) // 启动路由
  .use(router.allowedMethods())
  .listen(1002);
