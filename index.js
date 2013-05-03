function values (obj) {
  return Object.keys(obj).map(function (k) {return obj[k]})
}

function inRoom (server, name) {
  return values(server.clients).filter(function (socket) { return socket._rooms.indexOf(name) !== -1 })
}

function bindSocket (socket) {
  if (socket._rooms) return socket
  socket._rooms = []
  socket.join = function (name) {socket._rooms.push(name)}
  return socket
}

function bindServer (server) {
  if (server.room) return server
  server.on('connection', bindSocket)

  server.room = function (name, prop) {
    function proxy () {
      var args = arguments
      inRoom(server, name).forEach(function (socket) {
        socket[prop].apply(socket, args)
      })
    }
    return proxy
  }
  return server
}

module.exports = bindServer