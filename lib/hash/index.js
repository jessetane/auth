exports.sha256 = function (buffer, cb) {
  window.crypto.subtle.digest(
    {
      name: 'SHA-256',
    },
    buffer
  ).then(function (hash) {
    cb(null, hash)
  }).catch(function (err) {
    cb(err)
  })
}

exports.sha512 = function (buffer, cb) {
  window.crypto.subtle.digest(
    {
      name: 'SHA-512',
    },
    buffer
  ).then(function (hash) {
    cb(null, hash)
  }).catch(function (err) {
    cb(err)
  })
}
