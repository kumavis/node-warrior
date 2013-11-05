var websocket = require('websocket-stream')
var duplexEmitter = require('duplex-emitter')

App.JoinLobbyRoute = Em.Route.extend({

  needs: ['application'],

  setupController: function() {
    var applicationController = this.controllerFor('application')
    // setup connection with server
    var remoteServer = 'ws://'+document.domain+':8000/'
    var socket = websocket(remoteServer)
    socket.on('end', function() { console.log('disconnected from server :(') })
    socket.on('error', function(err) { console.log(err) })
    var connection = duplexEmitter(socket)
    // connect to server
    applicationController.connect(connection)
  },

})
