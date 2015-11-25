module.exports = KeyRingFromNetwork

var hg = require('hyperglue2')
var template = require('./index.html')

function KeyRingFromNetwork () {
  var el = hg(template)
  return el
}
