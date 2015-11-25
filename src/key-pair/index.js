module.exports = KeyPairSingle

var hg = require('hyperglue2')
var template = require('./index.html')
var router = require('uri-router')
var KeyRing = require('../key-ring/model')
var log = require('../log')

function KeyPairSingle () {
  var el = hg(template)
  el.show = show
  el.render = render.bind(el)
  el._label = el.querySelector('[name=label]')
  el._origin = el.querySelector('[name=origin]')
  el.addEventListener('input', el.render)
  el.addEventListener('submit', onsubmit.bind(el))
  el.querySelector('#forget')
    .addEventListener('click', onforget.bind(el))
  return el
}

function show () {
  var id = window.location.pathname.split('/')[2]
  var keyPair = KeyRing.sharedInstance.data.keyPairs[id]

  if (!keyPair) {
    router.replace('/key-pairs')
    return
  } else {
    this.keyPair = keyPair
  }

  var data = this.keyPair.data
  hg(this, {
    '[name=label]': {
      _value: data.label
    },
    '[name=origin]': {
      _value: data.origin
    },
    '#sha256': data.sha256,
    '#sha512': data.sha512,
    '#publicKey': data.publicKey.toString('hex'),
    '#privateKey': data.privateKey.toString('hex')
  })

  this.render()
}

function render () {
  var data = this.keyPair.data
  var changed = data.label !== this._label.value || 
                data.origin !== this._origin.value
  hg(this, {
    'img': {
      _attr: {
        src: 'http://localhost:9090/' + this._origin.value
      }
    },
    '#update': {
      _class: {
        hidden: !changed
      }
    }
  })
}

function onsubmit (evt) {
  var data = this.keyPair.data
  var changed = data.label !== this._label.value || 
                data.origin !== this._origin.value
  if (!changed) return
  data.label = this._label.value
  data.origin = this._origin.value
  KeyRing.sharedInstance.persist(function (err) {
    if (err) {
      log(err.message || 'Failed to update key pair')
      return
    }
    log('Key pair updated')
    this.render()
  }.bind(this))
}

function onforget (evt) {
  delete KeyRing.sharedInstance.data.keyPairs[this.keyPair.id]
  KeyRing.sharedInstance.persist(function (err) {
    if (err) {
      log(err.message || 'Failed to destroy key pair')
      return
    }
    log('Key pair destroyed')
    router.replace('/key-pairs')
  })
}
