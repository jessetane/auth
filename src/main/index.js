module.exports = AuthMainView

var hg = require('hyperglue2')
var template = require('./template.html')
var AuthServer = require('../server')

function AuthMainView () {
  this.el = hg(template)
}

AuthMainView.prototype.show = function () {
  if (!this.authServer) {
    this.authServer = new AuthServer(window.parent)
  }
}
