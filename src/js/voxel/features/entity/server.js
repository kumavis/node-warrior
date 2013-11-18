var extend = require('extend')
  , secureEval = require('../../secureEval.js')

module.exports = function(server) {

  // store npcs in memory
  server.entities = {}

  // get npcs from db
  server.voxelDb.db.get('npcs',function(err,val) {
    server.entities = val ? JSON.parse(val) : {}
  })

  // set npc
  server.baseServer.on('npc',function(npcData) {
    console.log('npc incomming!',npcData)
    var uuid = npcData.uuid
    var entity = server.entities[uuid]
    if (entity) {
      extend(entity,npcData)
    } else {
      server.entities[uuid] = npcData
    }
    updateNpcStore()
  })

  // send npcs on join
  server.baseServer.on('client.created',function(client) {
    Object.keys(server.entities).map(function(uuid) {
      var npcData = server.entities[uuid]
      client.connection.emit('npc',npcData)
    })
  })

  // extend sendUpdate to unclude
  // var sendOtherUpdates = server.sendUpdate
  // server.sendUpdate = function() {
  //   var self = this
    
  //   // perform other updates
  //   sendOtherUpdates()
    
  //   // create an update for NPCs
  //   var npcUuids = Object.keys(self.entities)
  //   if (npcUuids.length === 0) return
  //   var update = {positions:{}, date: +new Date()}
  //   npcUuids.map(function(id) {
  //     var npc = self.entities[id]
  //     update.positions[id] = {
  //       position: npc.mesh.position,
  //       rotation: {
  //         x: npc.mesh.rotation.x,
  //         y: npc.mesh.rotation.y,
  //       },
  //     }
  //   })

  //   server.baseServer.broadcast(null, 'npc.update', update)
  // }

  // start animating npcs
  setTimeout(animateNpcs,500)

  // store npcs
  function updateNpcStore() {
    server.voxelDb.db.put('npcs',JSON.stringify(server.entities))
  }

  // step through npcs and animate
  function animateNpcs() {
    var npcUuids = Object.keys(server.entities)
    var npcs = npcUuids.map(function(uuid){ return server.entities[uuid] })
    npcs.map(function(npc) {
      if (npc.update) {
        runNpcCode(npc,npc.update)
      }
    })
    setTimeout(animateNpcs,500)
  }

  // run code an npc function
  function runNpcCode(npc, code) {

    var output = secureEval(code, npc, {
      setPosition: setPosition,
      setRotation: setRotation,
      move: move,
      rotate: rotate,
    })

    function setPosition(arrayVector) {
      npc.pos = arrayVector
      server.baseServer.broadcast(null, 'npc.update', npc.uuid, {position: arrayVector})
    }

    function setRotation(arrayVector) {
      npc.rot = arrayVector
      server.baseServer.broadcast(null, 'npc.update', npc.uuid, {rotation: arrayVector})
    }

    function move(arrayVector) {
      var pos = npc.pos.slice()
      pos[0] += arrayVector[0]
      pos[1] += arrayVector[1]
      pos[2] += arrayVector[2]
      setPosition(pos)
    }

    function rotate(arrayVector) {
      var rot = npc.rot.slice()
      rot[0] += arrayVector[0]
      rot[1] += arrayVector[1]
      rot[2] += arrayVector[2]
      setRotation(rot)
    }

  }





}