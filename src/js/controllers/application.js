// external dependencies
var WebsocketStream = require('websocket-stream')
var LevelUser = require('level-user')
var VoxelLevel = require('voxel-level')
var Uuid = require('hat')
var concat = require('concat-stream')
// local dependencies
var Client = require('../voxel/client.js')
var Server = require('../voxel/server.js')
var RtcUtil = require('../util/rtc_utils.js')


App.ApplicationController = Em.Controller.extend({

  //
  // Public
  //

  // join a game corresponding to an Id (remote or local)
  joinGame: function joinGame(targetHostId) {
    var self = this
    // get currently hosted game's id, if any
    var existingHostId = self.get('rtcConnectionHash')
    // Self Hosted, if the target id is the current id
    if (targetHostId === existingHostId) {
      // intiate shared-tab side-by-side conncetion here
      // temporarily DIABLED b/c side-by-side perf is so bad
      // instead ask user to open a new window, after url change
      Em.run.next(function(){
        var gameLink = document.getElementById('gameContainer')
        gameLink.innerText = 'Temporary: This is the server only. Open current URL in new window to join.'
      })
    // Remote Hosted
    } else {
      self.connectToRtcHost(targetHostId)
    }
  },

  // // join the lobby server
  // joinLobby: function joinLobby() {
  //   var self = this
  //   // setup connection with server
  //   var remoteServer = 'ws://'+document.domain+':8000/'
  //   var duplexStream = WebsocketStream(remoteServer)
  //   duplexStream.on('end', function() { console.log('disconnected from server :(') })
  //   duplexStream.on('error', function(err) { console.log(err) })
  //   // connect to server
  //   self.connectClientToServer(duplexStream)
  // },

  // start a game server hosting the given world
  startGameServer: function startGameServer(world,callback) {
    var self = this
    // get voxel db
    var voxelDb = self.get('voxelDb')
    // create server
    var server = new Server({
      worldId: world.name,
      voxelDb: voxelDb,
    })
    self.set('server',server)
    server.on('ready',function(){
      var hostId = self.setupRtcHost()
      self.set('rtcConnectionHash',hostId)
      callback(hostId)
      // join local server
      // self.connectToRtcHost(hostId)
    })
  },

  // get worlds from db asynchronously
  getWorlds: function getWorlds(callback) {
    var user = this.get('user')
    var worldStream = user.db.sublevel('worlds').createValueStream({ valueEncoding: 'json' })
    var sentError
    worldStream.pipe(concat(function(worlds) {
      if (!worlds) worlds = []
      if (!sentError) callback(false, worlds)
    }))
    worldStream.on('error', function(err) {
      sentError = true
      callback(err)
    })
  },

  //
  // Private
  //

  // whether to display the game or hide it
  showGame: false,

  // the current user
  user: LevelUser({dbName: 'voxeljs', baseURL: document.domain }),

  // the voxel database for the current user
  voxelDb: Em.computed('user',function() {
    var user = this.get('user')
    if (user) return VoxelLevel(user.db)
  }),

  // the current game client, if any
  client: null,

  // the current local game server, if any
  server: null,

  // the local rtcConnection, if any
  rtcConnection: null,

  // used for connecting to a server (remote or local)
  connectClientToServer: function connectClientToServer(clientDuplexStream,serverDuplexStream) {
    var self = this
    
    // create the client after DOM updated
    Em.run.next(function(){
      var client = new Client({
        serverStream: clientDuplexStream,
        container: document.querySelector('#container'),
      })
      self.set('client',client)
      // for shared-tab side-by-side connections
      if (serverDuplexStream) self.get('server').connectClient(serverDuplexStream)
    })
  },

  setupRtcHost: function setupRtcHost() {
    var self = this
    var hostId = Uuid()
    var host = RtcUtil.RtcConnection(hostId)
    var server = self.get('server')
    // when a client has connected
    host.on('connectionEstablished',server.connectClient.bind(server))
    // remove client on disconnect
    host.on('connectionLost',server.removeClient.bind(server))
    return hostId
  },

  connectToRtcHost: function connectToRtcHost(hostId) {
    var self = this
    var host = RtcUtil.connectToHost(hostId)
    var server = self.get('server')
    host.on('connectionEstablished',self.connectClientToServer.bind(self))
    host.on('connectionLost',function(){
      console.error("connection lost")
    })
    return host
  },

})