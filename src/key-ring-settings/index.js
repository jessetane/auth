module.exports = KeyRingSync

var hg = require('hyperglue2')
var template = require('./index.html')
var KeyRing = require('../key-ring/model')
var storage = require('../storage')
var router = require('uri-router')
var log = require('../log')

function KeyRingSync () {
  var el = hg(template)
  el.addEventListener('click', onclick.bind(el))
  return el
}

function onclick (evt) {
  if (evt.target.id === 'destroy') {
    KeyRing.sharedInstance.destroy(function (err) {
      if (err) return log('Failed to destroy key ring', 'warn')
      delete storage[KeyRing.sharedInstance.id]
      KeyRing.sharedInstance = null
      log('Key ring destroyed')
      router.push('/')
    })
  }
}
