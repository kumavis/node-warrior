// external dependencies
var path = require('path')
var extend = require('extend')
var level = require('level')
var sublevel = require('level-sublevel')
// voxel dependencies
var voxelLevel = require('voxel-level')
var voxelServer = require('voxel-server')


module.exports = Server

function Server(opts) {
  // force instantiation via `new` keyword 
  if(!(this instanceof Server)) { return new Server(opts) }
  this.initialize(opts)
}

//
// Public
//

Server.prototype.connectClient = function(connection) {
  var self = this
  self.baseServer.connectClient(connection)
  self.bindClientEvents(connection)
  console.log(connection.id, 'joined')
}

Server.prototype.removeClient = function(connection) {
  var self = this
  self.baseServer.removeClient(connection)
  console.log(connection.id, 'left')
}

//
// Private
//

Server.prototype.initialize = function(opts) {
  var self = this

  var defaults = {
    generateChunks: false,
    chunkDistance: 2,
    materials: [
      ['grass', 'dirt', 'grass_dirt'],
      'dirt',
      'plank',
      'cobblestone',
      'brick',
      'bedrock',
      'glowstone',
      'netherrack',
      'obsidian',
      'diamond',
      'whitewool',
      'redwool',
      'bluewool',
    ],
    avatarInitialPosition: [2, 20, 2],
    forwardEvents: ['chat','modvox'],
  }
  var settings = self.settings = extend({}, defaults, opts)

  // setup fancy db
  var dbName = path.resolve(__dirname,'../world/',settings.worldId)
  console.log('db: '+dbName)
  self.voxelDb = voxelLevel(sublevel(level(dbName)))

  // create and initialize base game server
  var baseServer = self.baseServer = voxelServer(settings)
  self.game = baseServer.game
  
  self.bindServerEvents()
}

Server.prototype.bindClientEvents = function(connection) {
  var self = this
}

Server.prototype.bindServerEvents = function() {
  var self = this
  var settings = self.settings
  var baseServer = self.baseServer
  var game = self.game

  // setup modvoxes
  self.setupModvoxes()

  // setup world CRUD handlers
  baseServer.on('missingChunk', loadChunk)
  baseServer.on('set', function(pos, val) {
    var chunk = game.getChunkAtPosition(pos)
    storeChunk(chunk)
  })  
  // trigger world load
  game.voxels.requestMissingChunks(game.worldOrigin)

  // log chat
  baseServer.on('chat', function(message) {
    console.log('chat - ',message)
  })

  // handle errors
  baseServer.on('error',function(error){
    console.log('error - error caught in server:')
    console.log(error.stack)
  })

  // store chunk in db
  function storeChunk(chunk) {
    self.voxelDb.store(settings.worldId, chunk, function afterStore(err) {
      if (err) console.error('chunk store error', err.stack)
      console.log('stored chunk: '+chunk.position.join('|'))
    })
  }
  
  // load chunk from db
  function loadChunk(position, complete) {
    console.log('LOADING CHUNK')
    var game = self.game
    var cs = game.chunkSize
      , dimensions = [cs, cs, cs]
    self.voxelDb.load(settings.worldId, position, dimensions, function(err, chunk) {
      if (err) return console.error('chunk load error', err.stack)
      console.log('loaded chunk: '+position.join('|'))
      var chunk = {
        position: position,
        voxels: new Uint8Array(chunk.voxels.buffer),
        dims: chunk.dimensions
      }
      game.showChunk(chunk)
    })
  }

}

Server.prototype.setupModvoxes = function() {
  var self = this
  var baseServer = self.baseServer
  
  // get modvoxes from db
  self.voxelDb.db.get('modvoxes',function(err,val) {
    self.modvoxes = val ? JSON.parse(val) : {}
  })

  // set modvox
  baseServer.on('modvox',function(pos,code) {
    self.modvoxes[pos.join('|')] = code
    updateModvoxStore()
  })
  // remove modvox on overwrite
  baseServer.on('set', function(pos,val) {
    var modvox = self.modvoxes[pos.join('|')]
    if (modvox) delete self.modvoxes[pos.join('|')]
      updateModvoxStore()
  })
  // send modvoxes on join
  baseServer.on('client.join',function(client) {
    console.log('self.modvoxes')
    console.log(self.modvoxes)
    console.log('typeof self.modvoxes')
    console.log(typeof self.modvoxes)
    console.log('Object.keys(self.modvoxes)')
    console.log(Object.keys(self.modvoxes))
    Object.keys(self.modvoxes).map(function(posKey) {
      var code = self.modvoxes[posKey]
      var pos = posKey.split('|')
      client.connection.emit('modvox',pos,code)
    })
  })
  // store modvoxes
  function updateModvoxStore() {
    self.voxelDb.db.put('modvoxes',JSON.stringify(self.modvoxes))
  }

}
