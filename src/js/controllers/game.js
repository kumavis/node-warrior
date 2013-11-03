// external dependencies
var websocket = require('websocket-stream')
var duplexEmitter = require('duplex-emitter')
// local dependencies
var Client = require('../voxel/client.js')

App.GameController = Em.Controller.extend({

  initialize: function() {
    this.startGame()
  }.on('init'),

  startGame: function() {
    // setup connection with server
    var remoteServer = 'ws://'+document.domain+':8000/'
    var socket = websocket(remoteServer)
    // socket.on('end', function() { alert('disconnected from server :(') })
    socket.on('error', function(err) { console.log(err) })
    var connection = duplexEmitter(socket)

    // create the client
    var client = new Client({
      connection: connection,
    })
  },

})