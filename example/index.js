var router = require('uri-router')

process.env.AUTH_ORIGIN = 'http://localhost:9000'

router({
  watch: 'pathname',
  outlet: '#view-outlet',
  routes: {
    '/': require('./src/main')
  }
})
