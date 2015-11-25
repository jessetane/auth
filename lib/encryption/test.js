var tape = require('tape')
var api = require('./')

tape('encryption and decryption work', function (t) {
  t.plan(3)

  api.encrypt(Buffer('message'), Buffer('secret'), function (err, ciphertext) {
    t.error(err)
    api.decrypt(ciphertext, Buffer('secret'), function (err, message) {
      t.error(err)
      t.equal(Buffer(message).toString(), 'message')
    })
  })
})

tape('decryption with incorrect secret fails', function (t) {
  t.plan(2)

  api.encrypt(Buffer('message'), Buffer('secret'), function (err, ciphertext) {
    t.error(err)
    api.decrypt(ciphertext, Buffer('secret-bad'), function (err, message) {
      t.ok(err)
    })
  })  
})

tape('decryption of altered cipher text fails', function (t) {
  t.plan(2)

  api.encrypt(Buffer('message'), Buffer('secret'), function (err, ciphertext) {
    t.error(err)
    ciphertext[ciphertext.length - 1] = ciphertext[ciphertext.length - 1] + 1
    api.decrypt(ciphertext, Buffer('secret'), function (err, message) {
      t.ok(err)
    })
  })
})
