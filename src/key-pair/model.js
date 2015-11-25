module.exports = KeyPair

var crypto = require('../../lib/authentication')
var hash = require('../../lib/hash')

KeyPair.generate = function (data, cb) {
  crypto.generate(function (err, keyPair) {
    if (err) return cb(err)
    hash.sha256(keyPair.publicKey, function (err, sha256) {
      if (err) return cb(err)
      hash.sha512(keyPair.publicKey, function (err, sha512) {
        if (err) return cb(err)
        data.sha256 = Buffer(sha256).toString('hex')
        data.sha512 = Buffer(sha512).toString('hex')
        data.privateKey = keyPair.privateKey
        data.publicKey = keyPair.publicKey
        keyPair = new KeyPair(data)
        cb(null, keyPair)
      })
    })
  })
}

function KeyPair (data) {
  this.id = data.sha256
  this.data = data
  this.data.privateKey = Buffer(this.data.privateKey, 'base64')
  this.data.publicKey = Buffer(this.data.publicKey, 'base64')
}

KeyPair.prototype.toJSON = function () {
  return {
    sha256: this.data.sha256,
    sha512: this.data.sha512,
    label: this.data.label,
    origin: this.data.origin,
    privateKey: this.data.privateKey.toString('base64'),
    publicKey: this.data.publicKey.toString('base64')
  }
}
