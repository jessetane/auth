module.exports = KeyRing
module.exports.sharedInstance = null

var crypto = require('../../lib/encryption')
var KeyPair = require('../key-pair/model')

function KeyRing (id, data) {
  this.id = id
  this.data = data || { keyPairs: {} }
  this.decrypt = decrypt
  this.encrypt = encrypt
  this.persist = persist
  this.destroy = destroy
}

function decrypt (cb) {
  var data = Buffer(this.data.keyPairs, 'base64')
  var secret = Buffer(window.sessionStorage.secret)
  crypto.decrypt(data, secret, function (err, plaintext) {
    if (err) return cb(err)
    var pairs = JSON.parse(Buffer(plaintext).toString())
    this.data.keyPairs = {}
    for (var id in pairs) {
      this.data.keyPairs[id] = new KeyPair(pairs[id])
    }
    cb()
  }.bind(this))
}

function encrypt (cb) {
  var data = Buffer(JSON.stringify(this.data.keyPairs))
  var secret = Buffer(window.sessionStorage.secret)
  crypto.encrypt(data, secret, function (err, ciphertext) {
    if (err) return cb(err)
    this.data.keyPairs = Buffer(ciphertext).toString('base64')
    cb()
  }.bind(this))
}

function persist (cb) {
  var data = Buffer(JSON.stringify(this.data.keyPairs))
  var secret = Buffer(window.sessionStorage.secret)
  crypto.encrypt(data, secret, function (err, ciphertext) {
    if (err) return cb(err)
    window.localStorage[this.id] = JSON.stringify({
      keyPairs: Buffer(ciphertext).toString('base64')
    })
    cb()
  }.bind(this))
}

function destroy (cb) {
  delete window.localStorage[this.id]
  cb()
}
