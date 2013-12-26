window.require = require

// external dependencies
var levelUser = require('level-user')
var voxelLevel = require('voxel-level')
var voxelUtility = require('voxel')
var concat = require('concat-stream')
var uuid = require('hat')
var WalkieTalkieChannel = require('walkietalkie')
// local dependencies
var Client = require('./src/js/voxel/client.js')
var Server = require('./src/js/voxel/server.js')
var rtcUtil = require('./src/js/util/rtc_utils.js')

// START TEST APP

// If we are the client, a remote-host is specified
if (document.location.hash) {

  var hostId = document.location.hash.slice(1)
  var host = rtcUtil.connectToHost(hostId)
  host.on('connectionEstablished',function(connection){
    var client = new Client({
      isClient: true,
      connection: connection,
      container: document.body,
      texturePath: './node_modules/painterly-textures/textures/',
      playerTexture: './node_modules/minecraft-skin/viking.png',
    })
  })
  host.on('connectionLost',function(){
    console.error("connection lost")
  })

// if we are the host
} else {

  startGame(function(err,server){
    if (err) throw err
  
    var hostId = uuid()
    var host = rtcUtil.RtcConnection(hostId)
    // when an id has been established, set the hash location
    host.on('open',function(hostId){
      document.location.hash = hostId
      createAndConnectClientRtc(server,hostId)
    })
    // when a client has connected
    host.on('connectionEstablished',server.connectClient.bind(server))
    // remove client on disconnect
    host.on('connectionLost',server.removeClient.bind(server))
  })
}

// END TEST APP

function startGame(callback) {
  // get user
  console.log('get user')
  var user = levelUser({dbName: 'voxeljs', baseURL: document.domain })
  if (!user) throw "no user"
  // get db
  console.log('get db')
  if (!user.db) throw "no user db"
  var voxelDb = voxelLevel(user.db)
  // select first world from db
  console.log('selecting first world')
  // selectFirstWorld(user,voxelDb,callback)
  selectFirstWorld(user,voxelDb,function(err,server){
    if (err) throw err
    // createAndConnectClient(server)
    callback(err,server)
  })
}

// create a client and connect it to the server
function createAndConnectClient(server){
  var localNetwork = WalkieTalkieChannel()
  var connectionToServer = localNetwork.WalkieTalkie()
  var connectionToClient = localNetwork.WalkieTalkie()
  
  // ! Debug !
  console.log('-- connection logging enabled, "update" squeltched --')
  function logger(isClient){
    return function(args){
      var args = [].slice.apply(args)
      var eventName = args.shift()
      var direction = isClient ? '-->' : '<--'
      if (eventName !== 'update') {
        console.log(direction,eventName,args)
      }
    }
  }
  connectionToServer.on('*',logger(false))
  connectionToClient.on('*',logger(true))
  // ! Debug !

  var client = new Client({
    isClient: true,
    connection: connectionToServer,
    container: document.body,
    texturePath: './node_modules/painterly-textures/textures/',
    playerTexture: './node_modules/minecraft-skin/viking.png',
  })
  server.connectClient(connectionToClient)

}

// create a client and connect it to the server
function createAndConnectClientRtc(server,hostId){

  var host = rtcUtil.connectToHost(hostId)
  host.on('connectionEstablished',function(connection){
    var client = new Client({
      isClient: true,
      connection: connection,
      container: document.body,
      texturePath: './node_modules/painterly-textures/textures/',
      playerTexture: './node_modules/minecraft-skin/viking.png',
    })
  })
  host.on('connectionLost',function(){
    console.error("connection lost")
  })

}

// get worlds from db
function selectFirstWorld(user,voxelDb,callback){
  console.log('get worlds from db')
  getWorlds(user,function(error,worlds){
    console.log('got worlds from db')
    if (error) return callback(error)
    if (worlds.length === 0) {
      console.log('no worlds, creating one')
      generateWorld(voxelDb,"Neogenesis",function(error){
        if (error) return callback(error)
        selectFirstWorld(user,voxelDb,callback)
      })
    } else {
      console.log('worlds found, choosing first:',worlds[0].name)
      var server = startGameServer(voxelDb,worlds[0].name)
      server.on('ready',function(){
        callback(false,server)
      })
    }
  })
}

// create game server
function startGameServer(voxelDb,worldName) {
  // create server
  var server = new Server({
    worldId: worldName,
    voxelDb: voxelDb,
    forwardEvents: [],
  })
  return server
}

// get worlds stored in levelDB
function getWorlds(user,callback) {
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
}

// launch a server for this world
function generateWorld(voxelDb,worldName,callback) {
  var self = this
  var chunkRange = 2
  var generator = voxelUtility({})
  var errors = []
  // store level in world index
  var world = { id: uuid(), name: worldName, published: false }
  for (var x = -chunkRange; x<=chunkRange; x++) {
    for (var y = -chunkRange; y<=chunkRange; y++) {
      for (var z = -chunkRange; z<=chunkRange; z++) {
        var chunk = generator.generateChunk(x,y,z)
        // write a chunk to the db
        voxelDb.store(worldName, chunk, function(error, length) {
          if (error) errors.push(error)
        })
      }
    }
  }
  voxelDb.db.sublevel('worlds').put(world.id, world, {valueEncoding: 'json'}, function(error) {
    if (error) errors.push(error)
    if (errors.length) {
      callback(errors)
    } else {
      callback(false)
    }
  })

}