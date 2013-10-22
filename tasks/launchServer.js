// dependencies
var http = require('http')
var path = require('path')
var ecstatic = require('ecstatic')
var WebSocketServer = require('ws').Server
var websocket = require('websocket-stream')
var duplexEmitter = require('duplex-emitter')
var Server = require('../lib/server.js')

module.exports = function(grunt) {

  // Launch voxel-server
  grunt.registerTask('launchServer', function() {
    var port = 8000

    // create server
    var server = new Server({
      worldId: 'kumavis',
    })
    // setup WebSocketServer
    grunt.log.write('Starting host server.')
    var httpServer = http.createServer(ecstatic(path.join(__dirname, 'www')))
    var wss = new WebSocketServer({server: httpServer})
    httpServer.listen(port)
    wss.on('connection',function(ws) {
      var stream = websocket(ws)
      var connection = duplexEmitter(stream)
      server.connectClient(connection)
      // handle connection end/error
      stream.once('end', function(){ server.removeClient(connection) })
      stream.once('error', function(){ server.removeClient(connection) })
    })
    grunt.log.write('Server Listening on ', port)
  })

}