var eiojson = require('eiojson')
  , eiorooms = require('./')
  , assert = require('assert')
  , ok = require('okdone')
  , cleanup = require('cleanup')
  ;

var d = cleanup(function (error) {
  if (error) process.exit(1)
  process.exit()
})

var s = eiorooms(eiojson.server.listen(8080))

var completed = 0
function check (name) {
  completed += 1
  ok(name)
  if (completed > 3) throw new Error('Too many events!')
  if (completed === 3) {
    setTimeout(function () {
      ok.done()
      d.cleanup()
    }, 30)
  }
}

var tests = {}
tests.test1 = function (socket) {
  s.room('test1', 'json')({'test':1})
}
tests.test2 = function (socket) {
  s.room('test2', 'json')({'test':2})
}

s.on('connection', function (socket) {
  socket.on('json', function (obj) {
    if (obj.join) socket.join(obj.join)
    if (obj.test) tests[obj.test](socket)
  })
})

var c1 = eiojson.client('ws://localhost:8080')
c1.on('json', function (obj) {
  assert.deepEqual(obj, {test:1})
  check('c1')
})
var c2 = eiojson.client('ws://localhost:8080')
c2.on('json', function (obj) {
  assert.deepEqual(obj, {test:1})
  check('c2')
})
var c3 = eiojson.client('ws://localhost:8080')
c3.on('json', function (obj) {
  assert.deepEqual(obj, {test:2})
  check('c3')
})

c1.json({join:'test1'})
c2.json({join:'test1'})
c3.json({join:'test2'})

// Hack
setTimeout(function () {
  c3.json({test:'test1'})
  c3.json({test:'test2'})
}, 10)
