var WebSocketServer = require('ws').Server
var websocket = require('websocket-stream')
var http = require('http')
var path = require('path')
var doorknobServer = require('doorknob/server')

module.exports = function(opts, cb) {
  if (!opts) opts = { port: 8181 }
  
  var httpServer = opts.httpServer || doorknobServer(opts)
  var webSocketServer = opts.webSocketServer || new WebSocketServer({ noServer: true, clientTracking: false })
  
  httpServer.on('upgrade', function (req, socket, head) {
    httpServer.doorknob.getProfile(req, function(err, profile) {
      errorMessage = false
      if (err || !profile || !profile.email) {
        errorMessage = 'not logged in'
        if (opts.closeAnonymous) {
          socket.end()
          return cb(err || errorMessage)
        }
      }
      webSocketServer.handleUpgrade(req, socket, head, function(conn) {
        cb(errorMessage, req, conn, head)
      })
    })
  })
  
  return {
    httpServer: httpServer,
    webSocketServer: webSocketServer,
    options: opts
  }
}
