const { readFileSync, writeFileSync } = require('fs')
const { join } = require('path')
const fs = require('fs')
const Koa = require('koa')
const json = require('koa-json')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const cors = require('@koa/cors')
const { validKeys } = require('./utils.js')

const app = new Koa()
const router = new Router()

const responseBody = (code, msg) => ({ code, msg })

// CORS middleware
app.use(cors())
// JSON prettier middleware
app.use(json())
// Bodyparser middleware
app.use(bodyParser())

// app.use(async ctx => ctx.body = {msg: 'hello'})

router.get('/view', async (ctx) => {
  const jsonString = readFileSync(join(__dirname, './data.json'), 'utf8')
  ctx.body = JSON.parse(jsonString)
})

router.post('/upload', (ctx) => {
  const jsonString = readFileSync(join(__dirname, './data.json'), 'utf8')
  const json = JSON.parse(jsonString)
  const { name, ...it } = ctx.request.body
  const errList = validKeys(ctx.request.body)([
    'name',
    'version',
    'author',
    'main',
    'logo',
    'title',
    'description',
  ])
  if (errList.length) {
    ctx.body = responseBody(-1, errList[0])
    return
  }
  json.unreliable[name] = { name, ...it }
  writeFileSync(join(__dirname, './data.json'), JSON.stringify(json))
  ctx.body = responseBody(0, 'Upload extension success.')
})

router.post('/approve', (ctx) => {
  const { name } = ctx.request.body
  const jsonString = readFileSync(join(__dirname, './data.json'), 'utf8')
  const json = JSON.parse(jsonString)
  if (!json.unreliable[name]) {
    ctx.body = responseBody(-1, 'Not found in unreliable list.')
    return
  }
  json.reliable[name] = json.unreliable[name]
  delete json.unreliable[name]
  writeFileSync(join(__dirname, './data.json'), JSON.stringify(json))
  ctx.body = responseBody(0, 'Reliable success.')
})

router.post('/refuse', (ctx) => {
  const { name } = ctx.request.body
  const jsonString = readFileSync(join(__dirname, './data.json'), 'utf8')
  const json = JSON.parse(jsonString)
  if (!json.reliable[name]) {
    ctx.body = responseBody(-1, 'Not found in reliable list.')
    return
  }
  json.unreliable[name] = json.reliable[name]
  delete json.reliable[name]
  writeFileSync(join(__dirname, './data.json'), JSON.stringify(json))
  ctx.body = responseBody(0, 'Unreliable success.')
})

router.get('/list', (ctx) => {
  const jsonString = readFileSync(join(__dirname, './data.json'), 'utf8')
  const json = JSON.parse(jsonString)
  const data = json.reliable
  Object.values(data).forEach((module) => {
    if (!module.i18n || !module.i18n.length) return
    module.i18n = [
      module.i18n.find((val) => {
        return val.locale === ctx.query.locale
      }),
    ]
  })
  ctx.body = { code: 0, data: Object.values(data) }
})

router.get('/detail/:name', (ctx) => {
  const { name } = ctx.params
  const jsonString = readFileSync('./data.json', 'utf8')
  const json = JSON.parse(jsonString)
  const list = json.reliable
  const [plugin] = Object.values(list).filter((it) => it.name === name)
  if (!plugin) {
    ctx.request.body = responseBody(-1, 'Search Nothing')
    return
  }
  if (plugin.i18n && plugin.i18n.length) {
    plugin.i18n = [
      plugin.i18n.find((val) => {
        return val.locale === ctx.query.locale
      }),
    ]
  }
  // console.log(JSON.stringify(plugin, null, 2));
  ctx.body = { ...responseBody(0, 'Search success'), data: plugin }
})
// Router middleware
app.use(router.routes()).use(router.allowedMethods())

app.listen(80, () => console.log('Server started...'))
