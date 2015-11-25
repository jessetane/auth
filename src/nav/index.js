module.exports = Nav

var hg = require('hyperglue2')
var template = require('./index.html')
var KeyRing = require('../key-ring/model')

Nav.reusable = true

function Nav () {
  var el = hg(template)
  el.show = show
  return el
}

function show () {
  hg(this, {
    '#id': KeyRing.sharedInstance && KeyRing.sharedInstance.id,
    '#id, .button': {
      _class: {
        hidden: !KeyRing.sharedInstance
      }
    }
  })
}
