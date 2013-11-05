var uuid = require('hat')
var voxelUtility = require('voxel')

App.CreateIndexController = Em.ArrayController.extend({

  needs: ['application'],

  // locally available worlds, set from the route
  content: null,

  // name for the new world
  worldName: null,

  // if the world name is empty
  worldNameEmpty: Em.computed.empty('worldName'),

  // if the world settings are invalid
  worldSettingsInvalid: Em.computed.alias('worldNameEmpty'),

  actions: {

    // launch a server for this world
    generateWorld: function(world) {
      var self = this
      var applicationController = self.controllerFor('application')
      var worldName = self.get('worldName')
      var chunkRange = 2
      var generator = voxelUtility({})      
      voxelDb = applicationController.get('voxelDb')
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
        self.transitionToRoute('host')
      })

    },

  },

})