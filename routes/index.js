module.exports = function (app) {
  // 每个文件有一个module对象，
  //  exports是它的一个属性,表示对外输出的值，可以是对象、函数
  app.get('/', function (req, res) { // 回调函数，参数 req，res。。访问根目录在跳转到文章页面
    res.redirect('/posts') // posts文章页面
    // redirect用于URL跳转方法 设置响应的Location HTTP头，并且设置状态码302
  })

  // use([path],function).请求的路径的前缀部分匹配了这个路由路径，那么这个中间件就会被执行。
  app.use('/signup', require('./signup'))
  app.use('/signin', require('./signin'))
  app.use('/signout', require('./signout'))
  app.use('/posts', require('./posts'))
  app.use('/comments', require('./comments'))

  // 404 page
  app.use(function (req, res) {
    // 默认path为/，即所有的请求都会调用这个中间件
    if (!res.headersSent) {
      res.status(404).render('404')
    }
  })
}
