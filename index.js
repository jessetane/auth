var router = require('uri-router')
var storage = require('./src/storage')
var KeyRing = require('./src/key-ring/model')
var log = require('./src/log')

for (var id in window.localStorage) {
  var object = JSON.parse(window.localStorage[id])
  storage[id] = object
}

var active = storage[window.sessionStorage.id]
if (active) {
  KeyRing.sharedInstance = new KeyRing(window.sessionStorage.id, active)
  KeyRing.sharedInstance.decrypt(onready)
} else {
  onready()
}

function onready (err) {
  if (err) log(err)
  router({
    watch: 'pathname',
    outlet: document.querySelector('#nav'),
    routes: [
      ['.*', require('./src/nav')]
    ]
  })
  router({
    watch: 'pathname',
    outlet: document.querySelector('#app'),
    routes: [
      ['/key-rings/create',              require('./src/key-ring-create')],
      ['/key-rings/from-file',        require('./src/key-ring-from-file')],
      ['/key-rings/from-network',  require('./src/key-ring-from-network')],
      ['(/key-rings/decrypt)/([^\/]+)', require('./src/key-ring-decrypt')],
      ['(/key-rings)(/)?',                require('./src/key-ring-index')],
      ['/key-pairs/create',              require('./src/key-pair-create')],
      ['(/key-pairs)/([^\/]+)',                 require('./src/key-pair')],
      ['/key-pairs(/)?',                        require('./src/key-ring')],
      ['/key-rings/settings',          require('./src/key-ring-settings')],
      ['/key-rings/logout',                       require('./src/logout')],
      ['/',                  function () { router.replace('/key-rings') }],
      ['.*',                                   require('./src/not-found')]
    ]
  })
}