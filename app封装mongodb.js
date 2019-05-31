const Koa = require("koa"),
  Router = require("koa-router"),
  router = new Router(),
  app = new Koa(),
  db = require("./libs/mongodb");

app.use(async (ctx, next) => {
  await next();
});

router.get("/", async ctx => {
  
    
  db.find('user', {username: 'lisi12'}).then(res => {
  })
  db.insert('user', {username: 'ffgggg'}).then(res => {
  })
  db.update('user', {username: 'aaaaaaaaaaa'}, {username: '121212'}).then(res => {
  })
  db.delete('user', {username: 'zhangsan1'}).then(res => {
  })
  
});

// 第三方中间件
app
  .use(router.routes()) // 启动路由
  .use(router.allowedMethods())
  .listen(1002);
