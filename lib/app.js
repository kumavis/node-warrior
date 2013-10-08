// external dependencies
var websocket = require('websocket-stream')
var duplexEmitter = require('duplex-emitter')
// local dependencies
var Client = require('./client.js')
var Server = require('./server.js')


//
// Dedicated Server
//

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


//
// Self-Hosted
//

// var localNetwork = require('walkietalkie')()

// // create the client
// var client = new Client({
//   connection: localNetwork.WalkieTalkie(),
// })

// // create the server
// var server = new Server({
//   worldId: 'kumavis',
// })

// // connect client to server
// server.connectClient(localNetwork.WalkieTalkie())