var router = require('uri-router')
var KeyRing = require('../key-ring/model')
var log = require('../log')

module.exports = function () {
  KeyRing.sharedInstance.encrypt(function (err) {
    if (err) {
      log(err.message || 'Failed to encrypt keyring')
      return
    }
    log('Goodbye!')
    delete window.sessionStorage.id
    delete window.sessionStorage.secret
    KeyRing.sharedInstance = null
    router.replace('/')
  })
}
