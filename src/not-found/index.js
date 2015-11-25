module.exports = NotFound

var hg = require('hyperglue2')
var template = require('./index.html')

function NotFound () {
  var el = hg(template)
  return el
}
