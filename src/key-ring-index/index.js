module.exports = KeyRingIndex

var hg = require('hyperglue2')
var template = require('./index.html')
var router = require('uri-router')
var storage = require('../storage')
var KeyRing = require('../key-ring/model')

function KeyRingIndex () {
  var el = hg(template)
  el.show = show
  return el
}

function show () {
  if (KeyRing.sharedInstance) {
    router.replace('/key-pairs')
    return
  }

  var keyRings = Object.keys(storage).filter(function (id) {
    return !!storage[id].keyPairs
  }).map(function (id) {
    var ring = storage[id]
    return {
      'a': {
        _text: id,
        _attr: {
          href: '/key-rings/decrypt/' + id
        }
      }
    }
  })

  hg(this, {
    '#not-found': {
      _class: {
        hidden: keyRings.length
      }
    },
    '#key-rings': {
      _class: {
        hidden: keyRings.length === 0
      }
    },
    '#key-rings li': keyRings
  })
}
