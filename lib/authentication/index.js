exports.generate = function (cb) {
  generateKeyPair(function (err, keyPair) {
    if (err) return cb(err)
    exportKeyPair(keyPair, cb)
  })
}

exports.sign = function (message, privateKey, cb) {
  importKey(privateKey, 'pkcs8', function (err, privateKey) {
    if (err) return cb(err)
    sign(message, privateKey, cb)
  })
}

exports.verify = function (message, signature, publicKey, cb) {
  importKey(publicKey, 'spki', function (err, publicKey) {
    if (err) return cb(err)
    verify(message, signature, publicKey, cb)
  })
}

function generateKeyPair (cb) {
  window.crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-521',
    },
    true,
    [
      'sign',
      'verify'
    ]
  ).then(function (keyPair) {
    cb(null, keyPair)
  }, function (err) {
    cb(err)
  })
}

function exportKeyPair (keyPair, cb) {
  var n = 2
  var wrapper = {}
  exportKey(keyPair.privateKey, 'pkcs8', done.bind('privateKey'))
  exportKey(keyPair.publicKey, 'spki', done.bind('publicKey'))
  function done (err, key) {
    if (cb._called) return
    if (err) {
      cb._called = true
      return cb(err)
    }
    wrapper[this] = key
    if (--n === 0) {
      cb(null, wrapper)
    }
  }
}

function exportKey (key, format, cb) {
  window.crypto.subtle.exportKey(
    format,
    key
  ).then(function (key) {
    cb(null, key)
  }, function (err) {
    cb(err)
  })
}

function importKey (key, format, cb) {
  window.crypto.subtle.importKey(
    format,
    key,
    {
      name: "ECDSA",
      namedCurve: 'P-521'
    },
    true,
    format === 'pkcs8' ? [ 'sign' ] : [ 'verify' ]
  ).then(function (key) {
    cb(null, key)
  }, function (err) {
    cb(err)
  })
}

function sign (message, privateKey, cb) {
  window.crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: 'SHA-256'
    },
    privateKey,
    message
  ).then(function (signature) {
    cb(null, signature)
  }, function (err) {
    cb(err)
  })
}

function verify (message, signature, publicKey, cb) {
  window.crypto.subtle.verify(
    {
      name: 'ECDSA',
      hash: 'SHA-256'
    },
    publicKey,
    signature,
    message
  ).then(function (isValid) {
    var err = isValid ? null : new Error('Invalid signature')
    cb(err)
  }, function (err) {
    cb(err)
  })
}
