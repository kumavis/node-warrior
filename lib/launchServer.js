// deps
var path = require('path')
var level = require('level')
var sublevel = require('level-sublevel')
// voxel deps
var voxelLevel = require('voxel-level')
var voxelServer = require('voxel-server')


module.exports = function() {

  var settings = {
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
  }

  // setup fancy db
  var worldId = 'kumavis'
  var dbName = path.resolve(__dirname,'../world/',worldId)
  var voxelDb = voxelLevel(sublevel(level(dbName)))

  // initialize server
  var server = voxelServer(settings)
  var game = server.game

  // setup world CRUD
  game.voxels.on('missingChunk', loadChunk)
  game.voxels.requestMissingChunks(game.worldOrigin)
  server.on('set', function(id, pos, val) {
    var chunk = game.getChunkAtPosition(pos)
    storeChunk(chunk)
  })

  function storeChunk(chunk) {
    voxelDb.store(worldId, chunk, function afterStore(err) {
      if (err) console.error('chunk store error', err.stack)
      console.log('stored chunk: '+chunk.position.join('|'))
    })
  }
  
  function loadChunk(position, complete) {
    var cs = game.chunkSize
      , dimensions = [cs, cs, cs]
    voxelDb.load(worldId, position, dimensions, function(err, chunk) {
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

  return server

}
