// external dependencies
var websocket = require('websocket-stream')
var duplexEmitter = require('duplex-emitter')
var levelUser = require('level-user')
var voxelLevel = require('voxel-level')
var concat = require('concat-stream')
var uuid = require('hat')
// local dependencies
var Client = require('../voxel/client.js')
var Server = require('../voxel/server.js')
var rtcUtil = require('../util/rtc_utils.js')


App.ApplicationController = Em.Controller.extend({

  // whether to display the game or hide it
  showGame: false,

  // the current user
  user: levelUser({dbName: 'voxeljs', baseURL: document.domain }),

  // the voxel database for the current user
  voxelDb: Em.computed('user',function() {
    var user = this.get('user')
    if (user) return voxelLevel(user.db)
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

  // used for connecting locally, or to the lobby
  connect: function connect(clientConnection,serverConnection) {
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
    var hostId = uuid()
    var host = rtcUtil.RtcConnection(hostId)
    // when a client has connected
    host.on('connectionEstablished',server.connectClient.bind(server))
    // remove client on disconnect
    host.on('connectionLost',server.removeClient.bind(server))
    return hostId
  },

  connectToRtcHost: function connectToRtcHost(hostId) {
    var self = this
    var host = rtcUtil.connectToHost(hostId)
    host.on('connectionEstablished',self.connect.bind(self))
    host.on('connectionLost',function(){
      console.error("connection lost")
    })
    return host
  },



})