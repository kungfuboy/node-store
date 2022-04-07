const Koa = require("koa");
const json = require("koa-json");
const Router = require("koa-router");
const fs = require("fs");
const path = require("path");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");

const app = new Koa();
const router = new Router();

// CORS middleware
app.use(cors());
// JSON prettier middleware
app.use(json());
// Bodyparser middleware
app.use(bodyParser());

// app.use(async ctx => ctx.body = {msg: 'hello'})

const responseBody = (code, msg) => ({ code, msg });

router.get("/", async (ctx) => {
  ctx.body = "A";
});

router.get("/b", async (ctx) => {
  ctx.body = "B";
});

// Router middleware
app.use(router.routes()).use(router.allowedMethods());

app.listen(3333, () => console.log("Server started..."));
