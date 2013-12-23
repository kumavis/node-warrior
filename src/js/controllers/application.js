// external dependencies
var Websocket = require('websocket-stream')
var DuplexEmitter = require('duplex-emitter')
var LevelUser = require('level-user')
var VoxelLevel = require('voxel-level')
var Uuid = require('hat')
var WalkieTalkieChannel = require('walkietalkie')
var concat = require('concat-stream')
// local dependencies
var Client = require('../voxel/client.js')
var Server = require('../voxel/server.js')
var RtcUtil = require('../util/rtc_utils.js')


App.ApplicationController = Em.Controller.extend({

  // whether to display the game or hide it
  showGame: false,

  // the current user
  user: LevelUser({dbName: 'voxeljs', baseURL: document.domain }),

  // the voxel database for the current user
  voxelDb: Em.computed('user',function() {
    var user = this.get('user')
    if (user) return VoxelLevel(user.db)
  }),

  // get worlds from db asynchronously
  getWorlds: function getWorlds(cb) {
    var user = this.get('user')
    var worldStream = user.db.sublevel('worlds').createValueStream({ valueEncoding: 'json' })
    var sentError
    worldStream.pipe(concat(function(worlds) {
      if (!worlds) worlds = []
      if (!sentError) cb(false, worlds)
    }))
    worldStream.on('error', function(err) {
      sentError = true
      cb(err)
    })
  },

  // the current game client, if any
  client: null,

  // the current local game server, if any
  server: null,

  // the local rtcConnection, if any
  rtcConnection: null,

  // join a game corresponding to an Id (remote or local)
  joinGame: function joinGame(targetHostId) {
    var self = this
    // get currently hosted game's id, if any
    var existingHostId = self.get('rtcConnectionHash')
    // Self Hosted, if the target id is the current id
    if (targetHostId === existingHostId) {
      var localNetwork = WalkieTalkieChannel()
      var serverConnection = localNetwork.WalkieTalkie()
      var clientConnection = localNetwork.WalkieTalkie()
      self.connectClientToServer(serverConnection,clientConnection)
    // Remote Hosted
    } else {
      self.connectToRtcHost(targetHostId)
    }
  },

  // join the lobby server
  joinLobby: function joinLobby() {
    var self = this
    // setup connection with server
    var remoteServer = 'ws://'+document.domain+':8000/'
    var socket = Websocket(remoteServer)
    socket.on('end', function() { console.log('disconnected from server :(') })
    socket.on('error', function(err) { console.log(err) })
    var connection = DuplexEmitter(socket)
    // connect to server
    self.connectClientToServer(connection)
  },

  // used for connecting locally, or to the lobby
  connectClientToServer: function connectClientToServer(clientConnection,serverConnection) {
    var self = this
    // create the client
    Em.run.next(function(){
      var client = new Client({
        connection: clientConnection,
        container: document.querySelector('#container'),
      })
      self.set('client',client)
      if (serverConnection) self.get('server').connectClient(serverConnection)
    })
  },

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
    })
  },

  setupRtcHost: function setupRtcHost() {
    var self = this
    var hostId = Uuid()
    var host = RtcUtil.RtcConnection(hostId)
    // when a client has connected
    host.on('connectionEstablished',server.connectClient.bind(server))
    // remove client on disconnect
    host.on('connectionLost',server.removeClient.bind(server))
    return hostId
  },

  connectToRtcHost: function connectToRtcHost(hostId) {
    var self = this
    var host = RtcUtil.connectToHost(hostId)
    host.on('connectionEstablished',self.connectClientToServer.bind(self))
    host.on('connectionLost',function(){
      console.error("connection lost")
    })
    return host
  },



})