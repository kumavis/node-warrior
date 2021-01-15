// external dependencies
var WebsocketStream = require('websocket-stream')
var LevelUser = require('level-user')
var VoxelLevel = require('voxel-level')
var uuid = require('hat')
var concat = require('concat-stream')
var voxelUtility = require('voxel')
var pify = require('pify')
// local dependencies
var Client = require('./voxel/client.js')
var Server = require('./voxel/server.js')
var RtcUtil = require('./rtc-utils.js')


// Choose a level:
// <ul>
//   {{#each world in controller}}
//     <li {{action launchWorld world}}>{{world.name}}</li>
//   {{else}}
//     No Worlds Yet :( <br>
//   {{/each}}
// </ul>
// {{#link-to 'create'}}Create A New One!{{/link-to}}

const app = {

  //
  // Public
  //

  // join a game corresponding to an Id (remote or local)
  joinGame: function joinGame(targetHostId) {
    var self = this
    // get currently hosted game's id, if any
    var existingHostId = self.rtcConnectionHash
    // Self Hosted, if the target id is the current id
    if (targetHostId === existingHostId) {
      // intiate shared-tab side-by-side conncetion here
      // temporarily DIABLED b/c side-by-side perf is so bad
      // instead ask user to open a new window, after url change
      // Em.run.next(function(){
        var gameLink = document.getElementById('gameContainer')
        gameLink.innerText = 'Temporary: This is the server only. Open current URL in new window to join.'
      // })
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
    var voxelDb = self.voxelDb
    // create server
    var server = new Server({
      worldId: world.name,
      voxelDb: voxelDb,
    })
    self.server = server
    server.on('ready',function(){
      var hostId = world.id
      self.setupRtcHost(hostId)
      self.rtcConnectionHash = hostId
      callback(hostId)
      // join local server
      // self.connectToRtcHost(hostId)
    })
  },

  // get worlds from db asynchronously
  getWorlds: function getWorlds(callback) {
    var user = this.user
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
  get voxelDb () {
    var user = this.user
    if (user) return VoxelLevel(user.db)
  },

  // the current game client, if any
  client: null,

  // the current local game server, if any
  server: null,

  // the local rtcConnection, if any
  rtcConnection: null,

  // used for connecting to a server (remote or local)
  connectClientToServer: function connectClientToServer(clientDuplexStream, serverDuplexStream) {
    var self = this
    
    console.log('connectClientToServer')

    // create the client after DOM updated
    setTimeout(function(){
      var client = new Client({
        serverStream: clientDuplexStream,
        container: document.querySelector('#container'),
      })
      self.client = client
      // for shared-tab side-by-side connections
      if (serverDuplexStream) self.server.connectClient(serverDuplexStream)
    })
  },

  setupRtcHost: function setupRtcHost(hostId) {
    var self = this
    // var hostId = uuid()
    var host = RtcUtil.RtcConnection(hostId)
    var server = self.server
    // when a client has connected
    host.on('connectionEstablished',server.connectClient.bind(server))
    // remove client on disconnect
    host.on('connectionLost',server.removeClient.bind(server))
    return hostId
  },

  connectToRtcHost: function connectToRtcHost(hostId) {
    var self = this
    var host = RtcUtil.connectToHost(hostId)
    var server = self.server
    host.on('connectionEstablished',self.connectClientToServer.bind(self))
    host.on('connectionLost',function(){
      console.error("connection lost")
    })
    return host
  },

  // launch a server for this world
  generateWorld: function() {
    var self = this
    // var applicationController = self.controllerFor('application')
    // var worldName = self.get('worldName')
    var worldName = `world-${Math.random().toString().slice(2)}`
    var chunkRange = 2
    var generator = voxelUtility({})    
    var voxelDb = self.voxelDb  
    // store level in world index
    var world = { id: uuid(), name: worldName, published: false }
    for (var x = -chunkRange; x<=chunkRange; x++) {
      for (var y = -chunkRange; y<=chunkRange; y++) {
        for (var z = -chunkRange; z<=chunkRange; z++) {
          var chunk = generator.generateChunk(x,y,z)
          // write a chunk to the db
          voxelDb.store(worldName, chunk, function(err, length) {
            if (err) throw err
          })
        }
      }       
    }
    voxelDb.db.sublevel('worlds').put(world.id, world, {valueEncoding: 'json'}, function(err) {
      if (err) throw err
      // self.transitionToRoute('host')
      app.launchWorld(world)
    })

  },

  // launch a server for this world
  launchWorld: function(world) {
    var self = this
    self.startGameServer(world,function(hostId) {
      // self.transitionToRoute('join.rtc',hostId)    
      location.hash = hostId
      console.log('game started')
    })
  },

}

// module.exports = app

start()


async function start () {
  const targetWorldId = location.hash.slice(1)

  if (targetWorldId) {
    const worlds = await pify(cb => app.getWorlds(cb))()
    console.log(worlds)
    const matchingWorld = worlds.find(world => world.id === targetWorldId)
    if (matchingWorld) {
      console.log('hosting world')
      app.launchWorld(matchingWorld)
    } else {
      console.log('joining world')
      app.joinGame(targetWorldId)
    }
  } else {
    console.log('hosting new world')
    app.generateWorld()
  }
}

