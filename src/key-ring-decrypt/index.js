module.exports = KeyRingDecrypt

var hg = require('hyperglue2')
var template = require('./index.html')
var router = require('uri-router')
var storage = require('../storage')
var KeyRing = require('../key-ring/model')
var log = require('../log')

function KeyRingDecrypt () {
  var el = hg(template)
  el.show = show
  el.querySelector('form')
    .addEventListener('submit', onsubmit.bind(el))
  return el
}

function show () {
  if (KeyRing.sharedInstance) {
    router.replace('/key-pairs')
    return
  }

  this._id = decodeURIComponent(
    window.location.pathname.split('/')[3]
  )

  var keyRing = storage[this._id]
  if (!keyRing) {
    router.replace('/')
    return
  }

  hg(this, {
    'h2': this._id
  })
}

function onsubmit (evt) {
  var secret = this.querySelector('[name=secret]').value
  window.sessionStorage.id = this._id
  window.sessionStorage.secret = secret
  KeyRing.sharedInstance = new KeyRing(this._id, storage[this._id])
  KeyRing.sharedInstance.decrypt(function (err) {
    if (err) {
      delete window.sessionStorage.id
      delete window.sessionStorage.secret
      KeyRing.sharedInstance = null
      log(err.message || 'Failed to decrypt keyring', 'warn')
      return
    }
    log('Welcome!')
    router.replace('/key-pairs')
  })
}
