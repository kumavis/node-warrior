var voxel = require('voxel')
var voxelServer = require('voxel-server')

module.exports = function() {

  var settings = {
    generate: voxel.generator['Hill'],
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

  return voxelServer(settings)

}
