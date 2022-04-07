const Koa = require("koa");
const Router = require("koa-router");

const app = new Koa();
const router = new Router();

router.get("/", async (ctx) => {
  ctx.body = "A";
});

router.get("/b", async (ctx) => {
  ctx.body = "B";
});

// Router middleware
app.use(router.routes()).use(router.allowedMethods());

app.listen(3333, () => console.log("Server started..."));

module.exports = app;
