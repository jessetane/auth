module.exports = ExampleMainView

var hg = require('hyperglue2')
var template = require('./template.html')
var AuthClient = require('../../../src/client')

function ExampleMainView () {
  this.identity = null
  this.identities = []

  this.el = hg(template)
  this.authEl = this.el.querySelector('#auth')
  this.identitiesEl = this.el.querySelector('#identities')

  this._onauthLoad = this._onauthLoad.bind(this)
  this._onsignin = this._onsignin.bind(this)
  this._onclick = this._onclick.bind(this)
  this._onchangeIdentity = this._onchangeIdentity.bind(this)
  this.render = this.render.bind(this)
}

ExampleMainView.prototype.show = function () {
  if (!this.authClient) {
    this.authClient = true
    this.authEl.src = process.env.AUTH_ORIGIN
    this.authEl.addEventListener('load', this._onauthLoad)
    this.el.addEventListener('click', this._onclick)
    this.identitiesEl.addEventListener('change', this._onchangeIdentity)
  }
}

ExampleMainView.prototype._onauthLoad = function () {
  this.authEl.removeEventListener('load', this._onauthLoad)
  this.authClient = new AuthClient(this.authEl.contentWindow, process.env.AUTH_ORIGIN)

  // onload is a tiny bit too early sometimes?
  setTimeout(function () {
    this.authClient.signin(this._onsignin)
  }.bind(this))
}

ExampleMainView.prototype._onsignin = function (err, identities, newIdentityPublicKey) {
  if (err) throw err

  this.identities = identities
  this.identity = identities[newIdentityPublicKey] || identities[Object.keys(identities)[0]]
  this.render()
}

ExampleMainView.prototype._onclick = function (evt) {
  switch (evt.target.id) {
    case 'create-identity':
      this.authClient.createIdentity(this._onsignin)
      break
    case 'delete-identity':
      this.authClient.deleteIdentity(this.identity.publicKey, function (err) {
        if (err) throw err
        alert('identity deleted successfully')
        delete this.identities[this.identity.publicKey]
        this.identity = this.identities[Object.keys(this.identities)[0]]
        this.render()
      }.bind(this))
      break
  }
}

ExampleMainView.prototype._onchangeIdentity = function (evt) {
  var publicKey = this.identitiesEl.options[this.identitiesEl.selectedIndex].text
  this.identity = this.identities[publicKey]
  this.render()
}

ExampleMainView.prototype.render = function () {
  var options = []

  for (var publicKey in this.identities) {
    var identity = this.identities[publicKey]

    options.push({
      _text: publicKey,
      _attr: {
        value: publicKey,
        selected: publicKey === this.identity.publicKey ? 'selected' : null
      }
    })
  }

  hg(this.el, {
    '#identity': {
      _text: this.identity.publicKey,
      _class: {
        'error': !this.identity.valid
      }
    },
    '#identities option': options
  })
}

ExampleMainView.prototype.hide = function () {
  this.authEl.removeEventListener('load', this._onauthLoad)
  this.el.removeEventListener('click', this._onclick)
}
