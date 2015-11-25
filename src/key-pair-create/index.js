module.exports = KeyPairCreate

var hg = require('hyperglue2')
var template = require('./index.html')
var router = require('uri-router')
var KeyRing = require('../key-ring/model')
var KeyPair = require('../key-pair/model')
var log = require('../log')

function KeyPairCreate () {
  var el = hg(template)
  el.querySelector('form')
    .addEventListener('submit', onsubmit.bind(el))
  return el
}

function onsubmit (evt) {
  var origin = this.querySelector('[name=origin]').value
  var label = this.querySelector('[name=label]').value

  if (!origin) {
    log('Missing origin', 'warn')
    return
  } else if (!label) {
    log('Missing label', 'warn')
    return
  }

  KeyPair.generate({
    origin: origin,
    label: label
  }, function (err, keyPair) {
    if (err) {
      log(err.message || 'Failed to generate key pair', 'warn')
      return
    }
    KeyRing.sharedInstance.data.keyPairs[keyPair.id] = keyPair
    KeyRing.sharedInstance.persist(function (err) {
      if (err) {
        log(err.message || 'Failed to persist key pair', 'warn')
        return
      }
      log('Key pair generated successfully')
      router.replace('/key-pairs/' + keyPair.id)
    })
  })
}
