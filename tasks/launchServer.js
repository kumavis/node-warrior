// dependencies
var http = require('http')
var path = require('path')
var ecstatic = require('ecstatic')
var WebSocketServer = require('ws').Server
var websocket = require('websocket-stream')
var duplexEmitter = require('duplex-emitter')
var level = require('level')
var sublevel = require('level-sublevel')
// voxel dependencies
var voxelLevel = require('voxel-level')
// local dependencies
var Server = require('../src/js/voxel/server.js')

module.exports = function(grunt) {

  // hard coded options (temporary)
  var worldId = 'kumavis'
    , dbPath = path.resolve(__dirname,'../world/',worldId)
    , serverPort =  8000

  // Launch voxel-server
  grunt.registerTask('launchServer', function() {

    // setup fancy db
    grunt.log.write('using db: '+dbPath)
    var voxelDb = voxelLevel(sublevel(level(dbPath)))

    // create server
    var server = new Server({
      worldId: worldId,
      voxelDb: voxelDb,
    })
    // setup WebSocketServer
    grunt.log.write('Starting host server.')
    var httpServer = http.createServer(ecstatic(path.join(__dirname, 'www')))
    var wss = new WebSocketServer({server: httpServer})
    httpServer.listen(serverPort)
    wss.on('connection',function(ws) {
      var stream = websocket(ws)
      var connection = duplexEmitter(stream)
      server.connectClient(connection)
      // handle connection end/error
      stream.once('end', function(){ server.removeClient(connection) })
      stream.once('error', function(){ server.removeClient(connection) })
    })
    grunt.log.write('Server Listening on ', serverPort)
    
  })

}