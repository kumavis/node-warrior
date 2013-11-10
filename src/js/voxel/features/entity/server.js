module.exports = function(server) {

  // store npcs in memory
  server.npcs = {}

  // get npcs from db
  server.voxelDb.db.get('npcs',function(err,val) {
    server.npcs = val ? JSON.parse(val) : {}
  })

  // set npc
  server.baseServer.on('npc',function(npcData) {
    var uuid = npcData.uuid
    server.npcs[uuid] = npcData
    updateNpcStore()
  })

  // send npcs on join
  server.baseServer.on('client.created',function(client) {
    Object.keys(server.npcs).map(function(uuid) {
      var npcData = server.npcs[uuid]
      client.connection.emit('npc',npcData)
    })
  })

  // store npcs
  function updateNpcStore() {
    server.voxelDb.db.put('npcs',JSON.stringify(server.npcs))
  }

}