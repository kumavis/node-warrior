module.exports = function(server) {

  // store modvoxes in memory
  server.modvoxes = {}

  // get modvoxes from db
  server.voxelDb.db.get('modvoxes',function(err,val) {
    server.modvoxes = val ? JSON.parse(val) : {}
  })

  // set modvox
  server.baseServer.on('modvox',function(pos,code) {
    server.modvoxes[pos.join('|')] = code
    updateModvoxStore()
  })

  // remove modvox on overwrite
  server.baseServer.on('set', function(pos,val) {
    var modvox = server.modvoxes[pos.join('|')]
    if (modvox) {
      delete server.modvoxes[pos.join('|')]
      updateModvoxStore()
    }
  })

  // send modvoxes on join
  server.baseServer.on('client.join',function(client) {
    Object.keys(server.modvoxes).map(function(posKey) {
      var code = server.modvoxes[posKey]
      var pos = posKey.split('|')
      client.connection.emit('modvox',pos,code)
    })
  })

  // store modvoxes
  function updateModvoxStore() {
    server.voxelDb.db.put('modvoxes',JSON.stringify(server.modvoxes))
  }

}