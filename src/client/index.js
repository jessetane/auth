module.exports = AuthClient

var rpc = require('frame-rpc')
var queue = require('queue')
var base64 = require('base64-js')
var crypto = window.crypto
var subtle = window.crypto.subtle || window.crypto.webkitSubtle

function AuthClient (remoteWindow, remoteOrigin) {
  this.remote = rpc(window, remoteWindow, remoteOrigin)
}

AuthClient.prototype.signin = function (cb) {
  var nonce = new Uint8Array(256)
  crypto.getRandomValues(nonce)
  this.remote.call('signin', nonce, this._onsignin.bind(this, nonce, cb))
}

AuthClient.prototype.createIdentity = function (cb) {
  var nonce = new Uint8Array(256)
  crypto.getRandomValues(nonce)
  this.remote.call('createIdentity', nonce, this._onsignin.bind(this, nonce, cb))
}

AuthClient.prototype._onsignin = function (nonce, cb, err, identities, newPublicKey) {
  if (err) return cb(new Error(err))

  var self = this
  var q = queue()

  for (var publicKey in identities) (function (publicKey, signature) {
    identities[publicKey] = {
      publicKey: publicKey, 
      signature: signature
    }
    q.push(self._verifyIdentity.bind(self, identities[publicKey], nonce))
  })(publicKey, identities[publicKey])

  q.start(function () {
    cb(null, identities, newPublicKey)
  })
}

AuthClient.prototype._verifyIdentity = function (identity, nonce, cb) {
  this._importKey(identity, function (err, key) {
    if (err) return cb(err)

    subtle.verify({
      name: 'ECDSA',
      hash: {
        name: 'SHA-256'
      },
    }, key, identity.signature, nonce)
      .then(function (valid) {
        identity.valid = valid
        cb()
      }).catch(cb)
  })
}

AuthClient.prototype._importKey = function (identity, cb) {
  subtle.importKey('spki', base64.toByteArray(identity.publicKey), {
    name: 'ECDSA',
    namedCurve: 'P-256',
  }, false, [ 'verify' ])
    .then(function (key) {
      cb(null, key)
    }).catch(cb)
}

AuthClient.prototype.deleteIdentity = function (publicKey, cb) {
  this.remote.call('deleteIdentity', publicKey, function (err) {
    if (err) arguments[0] = new Error(err)
    cb.apply(null, arguments)
  })
}
