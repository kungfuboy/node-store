const Koa = require('koa')
const json = require('koa-json')
const Router = require('koa-router')
const fs = require('fs')
const path = require('path')
const bodyParser = require('koa-bodyparser')
const cors = require('@koa/cors')

const app = new Koa()
const router = new Router()

app.use(cors())
// JSON prettier middleware
app.use(json())
// Bodyparser middleware
app.use(bodyParser())

// app.use(async ctx => ctx.body = {msg: 'hello'})

const errorBody = (code, msg) => ({ code, msg })

router.get('/view', async (ctx) => {
  const json = fs.readFileSync('./data.json', 'utf8')
  ctx.body = json
})

router.post('/upload', (ctx) => {
  const json = fs.readFileSync('./data.json', 'utf8')
  const { name, version, author, main, ...it } = ctx.request.body
  if (!name) {
    ctx.request.body = errorBody(-1, `You need sumbit 'name' data.`)
  }
  if (!version) {
    ctx.request.body = errorBody(-1, `You need sumbit 'version' data.`)
  }
  if (!author) {
    ctx.request.body = errorBody(-1, `You need sumbit 'author' data.`)
  }
  if (!main) {
    ctx.request.body = errorBody(-1, `You need sumbit 'main' data.`)
  }
  json.unreliable[name] = { name, version, author, main, ...it }
  fs.writeFileSync('./data.json', json)
  ctx.request.body = successBody(0, 'Save data success.')
})

router.get('/data/:name', (ctx) => {
  console.log(ctx.params.name)
})

// Router middleware
app.use(router.routes()).use(router.allowedMethods())

app.listen(3000, () => console.log('Server started...'))
