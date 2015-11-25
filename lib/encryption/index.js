exports.encrypt = function (message, secret, cb) {
  importSecret(secret, function (err, key) {
    if (err) return cb(err)
    deriveKey(key, null, null, function (err, key) {
      if (err) return cb(err)
      encrypt(message, key, cb)
    })
  })
}

exports.decrypt = function (message, secret, cb) {
  var salt = message.slice(0, 128)
  var iterations = new Float32Array(message.buffer, 128, 4)
  iterations = iterations[0]
  message = message.slice(128 + 4)
  importSecret(secret, function (err, key) {
    if (err) return cb(err)
    deriveKey(key, salt, iterations, function (err, key) {
      if (err) return cb(err)
      decrypt(message, key, cb)
    })
  })
}

function importSecret (secret, cb) {
  window.crypto.subtle.importKey(
    'raw',
    secret,
    {
      name: 'PBKDF2'
    },
    false,
    [
      'deriveKey'
    ]
  ).then(function (key) {
    cb(null, key)
  }, function (err) {
    cb(err)
  })
}

function deriveKey (key, salt, iterations, cb) {
  salt = salt || window.crypto.getRandomValues(new Uint8Array(128))
  iterations = iterations || (0x10000 + ~~(0x10000 * Math.random()))
  window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: { name: 'SHA-512' },
    },
    key,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    [
      'encrypt',
      'decrypt'
    ]
  ).then(function (key) {
    key._salt = salt
    key._iterations = iterations
    cb(null, key)
  }, function (err) {
    cb(err)
  })
}

function encrypt (message, key, cb) {
  var iv = window.crypto.getRandomValues(new Uint8Array(12))
  window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128
    },
    key,
    message
  ).then(function (encrypted) {
    encrypted = new Uint8Array(encrypted)
    var data = new Uint8Array(128 + 4 + 12 + encrypted.length)
    var iterations = new Float32Array(1)
    iterations[0] = key._iterations
    iterations = new Uint8Array(iterations.buffer)
    data.set(key._salt, 0)
    data.set(iterations, 128)
    data.set(iv, 128 + 4)
    data.set(encrypted, 128 + 4 + 12)
    cb(null, data)
  }, function (err) {
    cb(err)
  })
}

function decrypt (message, key, cb) {
  var iv = message.slice(0, 12)
  message = message.slice(12)
  window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128
    },
    key,
    message
  ).then(function (decrypted) {
    cb(null, new Uint8Array(decrypted))
  }, function (err) {
    cb(err)
  })
}
