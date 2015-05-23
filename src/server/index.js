module.exports = AuthServer

var rpc = require('frame-rpc')
var queue = require('queue')
var base64 = require('base64-js')
var subtle = window.crypto.subtle || window.crypto.webkitSubtle

function AuthServer (remoteWindow) {
  this.remote = rpc(window, remoteWindow, null, this)
}

AuthServer.prototype._loadIdentities = function () {
  var temp = localStorage.getItem('identities/' + this.remote.origin)
  this.identities = temp ? JSON.parse(temp) : {}
}

AuthServer.prototype.signin = function (nonce, cb) {
  cb = wrapCallback(cb)

  try {
    this._loadIdentities()
  } catch (err) {
    return cb(err)
  }

  if (!Object.keys(this.identities).length) {
    return this.createIdentity(nonce, cb)
  }

  this._generateSignatures(nonce, cb)
}

AuthServer.prototype.createIdentity = function (nonce, cb) {
  var self = this
  cb = wrapCallback(cb)

  try {
    this._loadIdentities()
  } catch (err) {
    return cb(err)
  }

  subtle.generateKey({
    name: "ECDSA",
    namedCurve: "P-256",
  }, true, [ 'sign', 'verify' ])
    .then(function (key) {
      self._exportKey(key, didExportKey)
    })
    .catch(cb)

  function didExportKey (err, publicKey, privateKey) {
    if (err) return cb(err)
    self.identities[publicKey] = privateKey
    localStorage.setItem('identities/' + self.remote.origin, JSON.stringify(self.identities))
    self._generateSignatures(nonce, didGenerateSignatures.bind(null, publicKey))
  }

  function didGenerateSignatures (newPublicKey, err, signatures) {
    cb(err, signatures, newPublicKey)
  }
}

AuthServer.prototype.deleteIdentity = function (publicKey, cb) {
  cb = wrapCallback(cb)

  try {
    this._loadIdentities()
  } catch (err) {
    return cb(err)
  }

  if (!this.identities || !this.identities[publicKey]) {
    return cb(new Error('identity does not exist'))
  }

  delete this.identities[publicKey]
  localStorage.setItem('identities/' + this.remote.origin, JSON.stringify(this.identities))
  cb()
}

AuthServer.prototype._exportKey = function (key, cb) {
  var publicKey = null
  var privateKey = null
  var q = queue()

  q.push(function (cb) {
    subtle.exportKey('spki', key.publicKey)
      .then(function (data) {
        data = new Uint8Array(data)
        publicKey = base64.fromByteArray(data)
        cb()
      }).catch(cb)
  })

  q.push(function (cb) {
    subtle.exportKey('pkcs8', key.privateKey)
      .then(function (data) {
        data = new Uint8Array(data)
        privateKey = base64.fromByteArray(data)
        cb()
      }).catch(cb);
  })

  q.start(function (err) {
    cb(err, publicKey, privateKey)
  })
}

AuthServer.prototype._generateSignatures = function (nonce, cb) {
  var self = this
  var signatures = {}
  var q = queue()

  for (var publicKey in this.identities) (function (publicKey, privateKey) {
    q.push(function (cb) {
      self._importKey(base64.toByteArray(privateKey), function (err, key) {
        if (err) return cb(err)
        self._signNonce(nonce, key, function (err, signature) {
          if (err) return cb(err)
          signatures[publicKey] = signature
          cb()
        })
      })
    })
  })(publicKey, this.identities[publicKey])

  q.start(function (err) {
    if (err) return cb(err)
    cb(null, signatures)
  })
}

AuthServer.prototype._importKey = function (privateKey, cb) {
  subtle.importKey('pkcs8', privateKey, {
    name: 'ECDSA',
    namedCurve: 'P-256',
  }, false, [ 'sign' ])
    .then(function (key) {
      cb(null, key)
    }).catch(cb)
}

AuthServer.prototype._signNonce = function (nonce, privateKey, cb) {
  subtle.sign({
    name: 'ECDSA',
    hash: {
      name: 'SHA-256'
    },
  }, privateKey, nonce)
    .then(function (signature) {
      cb(null, signature)
    }).catch(cb)
}

function wrapCallback (cb) {
  return function () {
    var err = arguments[0]
    if (err) {
      arguments[0] = err.message
    }
    cb.apply(null, arguments)
  }
}
