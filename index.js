var router = require('uri-router')

router({
  watch: 'pathname',
  outlet: '#view-outlet',
  routes: {
    '/': require('./src/main')
  }
})
