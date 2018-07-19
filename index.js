const path = require('path')// 导入模块
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const config = require('config-lite')(__dirname)
const routes = require('./routes')
const pkg = require('./package')
const winston = require('winston')
const expressWinston = require('express-winston')
const app = express()

// 设置模板目录：模板：动态页面：把样式与数据组合生成html页面
app.set('views', path.join(__dirname, 'views'))
// 设置模板引擎为 ejs
app.set('view engine', 'ejs')

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')))

// session 中间件：
app.use(session({
  name: config.session.key, // 设置 cookie 中保存 session id 的字段名称
  secret: config.session.secret, // 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
  resave: true, // 强制更新 session
  saveUninitialized: false, // 设置为 false，强制创建一个 session，即使用户未登录
  cookie: {
    maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除，
  },
  store: new MongoStore({// 将 session 存储到 mongodb
    url: config.mongodb// mongodb 地址
  })
}))

// flash 中间件，用来显示通知
app.use(flash())

// 处理表单及文件上传的中间件：头像
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'public/img'), // 保存到服务器目录
  keepExtensions: true// 保留后缀
}))

// 设置模板全局常量
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
}
// 添加模板必需的三个变量
app.use(function (req, res, next) {
  res.locals.user = req.session.user
  res.locals.success = req.flash('success').toString()
  res.locals.error = req.flash('error').toString()
  next()
})
/*
 // 调用 res.render 的时候就不用传入这四个变量了
 express 为我们自动 merge 并传入了模板，所以我们可以在模板中直接使用这四个变量。
*/

// /*
// 正常请求的日志：记录访问情况、注册……等
app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}))
// */
// 路由：根据请求返回对应页面。。发出请求：：url，http方法get：简单请求一个url，参数在url中。和post
routes(app)
// /*
// 错误请求的日志
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}))
// */
app.use(function (err, req, res, next) {
  // 实现了将错误信息用页面通知展示的功能，刷新页面将会跳转到主页并显示『权限不足』的红色通知。
  console.error(err)
  req.flash('error', err.message)
  res.redirect('/posts')
})

if (module.parent) {
  // 被 require，则导出 app
  module.exports = app
} else {
  // 监听端口，启动程序
  app.listen(config.port, function () {
    console.log(`${pkg.name} listening on port ${config.port}`)
  })
}
