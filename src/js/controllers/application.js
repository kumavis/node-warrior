// external dependencies
var websocket = require('websocket-stream')
var duplexEmitter = require('duplex-emitter')
var levelUser = require('level-user')
var voxelLevel = require('voxel-level')
var concat = require('concat-stream')
// local dependencies
var Client = require('../voxel/client.js')
var Server = require('../voxel/server.js')
var Rtc = require('rtc-quickconnect')

App.ApplicationController = Em.Controller.extend({

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

  connect: function connect(connectionClient,connectionServer) {
    var self = this
    // create the client
    Em.run.next(function(){
      var client = new Client({
        connection: connectionClient,
        container: document.querySelector('#container'),
      })
      self.set('client',client)
      if (connectionServer) self.get('server').connectClient(connectionServer)
    })
  },

  startGameServer: function startGameServer(world) {
    // get voxel db
    var voxelDb = this.get('voxelDb')
    // create server
    var server = new Server({
      worldId: world.name,
      voxelDb: voxelDb,
    })
    this.set('server',server)
    // connect to rtc with a random hash
    this.connectRtc()
    return server
  },

  connectRtc: function connectRtc(hash) {
    // start webRTC server
    var rtcConnection = Rtc({
      signaller: 'http://sig.rtc.io:50000',
      hash: hash,
      ns: 'dctest',
      data: true,
      debug: true,
      setHashLocation: false,
    })
    this.set('rtcConnection',rtcConnection)
    return rtcConnection
  },

})