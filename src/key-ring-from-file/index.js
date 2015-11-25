module.exports = KeyRingFromFile

var hg = require('hyperglue2')
var template = require('./index.html')

function KeyRingFromFile () {
  var el = hg(template)
  return el
}
