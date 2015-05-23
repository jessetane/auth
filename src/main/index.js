module.exports = AuthMainView

var hg = require('hyperglue2')
var template = require('./template.html')
var AuthServer = require('../server')

function AuthMainView () {
  this.el = hg(template)
  this.render = this.render.bind(this)
}

AuthMainView.prototype.show = function () {
  if (!this.authServer) {
    this.authServer = new AuthServer(window.parent)
    window.addEventListener('message', this.render);
  }
}

AuthMainView.prototype.render = function () {
  if (this.authServer.remote.origin) {
    hg(this.el, {
      '#origin': this.authServer.remote.origin
    })
  }
}
