module.exports = KeyRingSingle

var hg = require('hyperglue2')
var template = require('./index.html')
var router = require('uri-router')
var KeyRing = require('./model')

function KeyRingSingle () {
  var el = hg(template)
  el.show = show
  return el
}

function show () {
  if (!KeyRing.sharedInstance) {
    router.replace('/')
    return
  }

  var data = KeyRing.sharedInstance.data
  var keyPairs = Object.keys(data.keyPairs).map(function (id) {
    var keyPair = data.keyPairs[id]
    return {
      a: {
        _text: keyPair.data.label,
        _attr: {
          href: '/key-pairs/' + keyPair.id
        }
      }
    }
  })

  hg(this, {
    '#not-found': {
      _class: {
        hidden: keyPairs.length > 0
      }
    },
    '#key-pairs': {
      _class: {
        hidden: keyPairs.length === 0
      }
    },
    '#key-pairs li': keyPairs
  })
}
