var JSBuilder = require('build-js')
var http = require('app-server')

new JSBuilder({
  src: 'test/index.js',
  dest: 'test/build.js'
}).watch(function (err) {
  if (err) console.log(err.message)
  else console.log('test rebuilt')
})

var server = http({
  share: 'test'
}, function (err) {
  if (err) throw err
  console.log('test server listening on port ' + server.port)
})

server.middleware = function (req, res, next) {
  console.log('test server got request: ' + req.method + ' ' + req.url)
  next()
}
