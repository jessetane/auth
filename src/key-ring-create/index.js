module.exports = KeyRingCreate

var hg = require('hyperglue2')
var template = require('./index.html')
var router = require('uri-router')
var storage = require('../storage')
var KeyRing = require('../key-ring/model')
var log = require('../log')

function KeyRingCreate () {
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
}

function onsubmit (evt) {
  var id = this.querySelector('[name=id]').value
  var secret = this.querySelector('[name=secret]').value

  if (!id) {
    log('Missing name', 'warn')
    return
  } else if (storage[id]) {
    log('Another keyring with the same name is already stored locally', 'warn')
    return
  } else if (!secret || secret.length < 1) {
    log('Secret should be at least 24 characters long', 'warn')
    return
  }

  window.sessionStorage.id = id
  window.sessionStorage.secret = secret
  KeyRing.sharedInstance = new KeyRing(id)
  KeyRing.sharedInstance.persist(function (err) {
    if (err) {
      delete window.sessionStorage.id
      delete window.sessionStorage.secret
      KeyRing.sharedInstance = null
      log(err.message, 'warn')
      return
    }
    log('Key ring created successfully')
    storage[id] = KeyRing.sharedInstance.data
    router.replace('/key-pairs')
  })
}
