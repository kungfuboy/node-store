const Koa = require('koa')
const json = require('koa-json')
const Router = require('koa-router')
const fs = require('fs')
const path = require('path')
const bodyParser = require('koa-bodyparser')
const cors = require('@koa/cors')

const app = new Koa()
const router = new Router()

// CORS middleware
app.use(cors())
// JSON prettier middleware
app.use(json())
// Bodyparser middleware
app.use(bodyParser())

// app.use(async ctx => ctx.body = {msg: 'hello'})

const responseBody = (code, msg) => ({ code, msg })

router.get('/view', async (ctx) => {
  const jsonString = fs.readFileSync('./data.json', 'utf8')
  ctx.body = JSON.parse(jsonString)
})

router.post('/upload', (ctx) => {
  const jsonString = fs.readFileSync('./data.json', 'utf8')
  const json = JSON.parse(jsonString)
  const { name, version, main, author, ...it } = ctx.request.body
  if (!name) {
    ctx.request.body = responseBody(-1, `You need sumbit 'name' data.`)
  }
  if (!version) {
    ctx.request.body = responseBody(-1, `You need sumbit 'version' data.`)
  }
  if (!author) {
    ctx.request.body = responseBody(-1, `You need sumbit 'author' data.`)
  }
  if (!main) {
    ctx.request.body = responseBody(-1, `You need sumbit 'main' data.`)
  }
  json.unreliable[name] = { name, version, author, main, ...it }
  fs.writeFileSync('./data.json', JSON.stringify(json))
  ctx.body = responseBody(0, 'Save data success.')
})

router.post('/reliable', (ctx) => {
  const { name } = ctx.request.body
  const jsonString = fs.readFileSync('./data.json', 'utf8')
  const json = JSON.parse(jsonString)
  if (!json.unreliable[name]) {
    ctx.body = responseBody(-1, 'Not found in unreliable list.')
    return
  }
  json.reliable[name] = json.unreliable[name]
  delete json.unreliable[name]
  fs.writeFileSync('./data.json', JSON.stringify(json))
  ctx.body = responseBody(0, 'Reliable success.')
})

router.post('/unreliable', (ctx) => {
  const { name } = ctx.request.body
  const jsonString = fs.readFileSync('./data.json', 'utf8')
  const json = JSON.parse(jsonString)
  if (!json.reliable[name]) {
    ctx.body = responseBody(-1, 'Not found in reliable list.')
    return
  }
  json.unreliable[name] = json.reliable[name]
  delete json.reliable[name]
  fs.writeFileSync('./data.json', JSON.stringify(json))
  ctx.body = responseBody(0, 'Unreliable success.')
})

router.get('/list', (ctx) => {
  const jsonString = fs.readFileSync('./data.json', 'utf8')
  const json = JSON.parse(jsonString)
  const data = json.reliable
  ctx.body = { code: 0, data: Object.values(data) }
})

// router.get("/detail/:name", (ctx) => {
//   const jsonString = fs.readFileSync("./data.json", "utf8");
//   const json = JSON.parse(jsonString);
//   const { name } = ctx.request.params;
//   const data = json.reliable[name];
//   ctx.body = { code: 0, data };
// });

router.get('/detail/:name', (ctx) => {
  const { name } = ctx.params
  const jsonString = fs.readFileSync('./data.json', 'utf8')
  const json = JSON.parse(jsonString)
  const list = json.reliable
  const [plugin] = Object.values(list).filter((it) => it.name === name)
  if (!plugin) {
    ctx.request.body = responseBody(-1, 'Search Nothing')
    return
  }
  console.log('==>', plugin)
  // console.log(JSON.stringify(plugin, null, 2));
  ctx.request.body = { ...responseBody(0, 'Search success'), data: plugin }
})
// Router middleware
app.use(router.routes()).use(router.allowedMethods())

app.listen(3333, () => console.log('Server started...'))

module.exports = app
