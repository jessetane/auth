var tape = require('tape')
var api = require('./')

tape('identity generation works', function (t) {
  t.plan(3)

  api.generate(function (err, identity) {
    t.error(err)
    t.equal(identity.privateKey.byteLength, 241)
    t.equal(identity.publicKey.byteLength, 158)
  })
})

tape('signing and verification work', function (t) {
  t.plan(5)

  api.generate(function (err, identity) {
    t.error(err)
    api.sign(Buffer('message'), identity.privateKey, function (err, signature) {
      t.error(err)
      t.ok(signature instanceof ArrayBuffer)
      t.equal(signature.byteLength, 132)
      api.verify(Buffer('message'), signature, identity.publicKey, function (err) {
        t.error(err)
      })
    })
  })
})

tape('verification with corrupt signature fails', function (t) {
  t.plan(3)

  api.generate(function (err, identity) {
    t.error(err)
    api.sign(Buffer('message'), identity.privateKey, function (err, signature) {
      t.error(err)
      signature = new Uint8Array(signature)
      signature[0]++
      api.verify(Buffer('message'), signature, identity.publicKey, function (err) {
        t.ok(err)
      })
    })
  }) 
})

tape('verification with incorrect public key fails', function (t) {
  t.plan(3)

  api.generate(function (err, identity) {
    t.error(err)
    api.sign(Buffer('message'), identity.privateKey, function (err, signature) {
      t.error(err)
      identity.publicKey = new Uint8Array(identity.publicKey)
      identity.publicKey[0]++
      api.verify(Buffer('message'), signature, identity.publicKey, function (err) {
        t.ok(err)
      })
    })
  }) 
})
