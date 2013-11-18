var hat = require('hat')
  , extend = require('extend')
  , skin = require('minecraft-skin')


module.exports = function(client) {
 
  // store entities and npcs on the client
  client.entities = {}
  client.npcs = {}

  // register incomming entities
  client.connection.on('npc',function(npcData) {
    // Update Entity
    if (npcData.uuid in client.entities) {
      _updateEntity(npcData)
    // New Entity
    } else {
      _addNpc(npcData)
    }
  })

  // register for npc updates
  client.connection.on('npc.update', _updateNpcState)
  window._updateNpcState = _updateNpcState

  // expose api for consumer
  return {
    createNpc: createNpc,
    updateEntity: updateEntity,
    selectEntity: selectEntity,
  }

  // create an entity
  function createNpc(skinName,pos) {
    var pos = pos || [0,1,0]
      , rot = rot || [0,0,0]
    var npcData = {uuid: hat(), pos: pos, rot: rot, skinName: skinName}
    client.connection.emit('npc',npcData)
    var npc = _addNpc(npcData)
    return npc
  }

  // update an entity
  function updateEntity(npcData) {
    if (!npcData.uuid) throw 'no uuid specified'
    if (!npcData.uuid in client.entities) throw 'no entity with specified uuid: '+npcData.uuid
    client.connection.emit('npc',npcData)
    _updateEntity(npcData)
  }

  // find an entity from a raycast from the camera's perspective
  function selectEntity() {
    var game = client.game
      , THREE = game.THREE
      , cameraPos = game.cameraPosition()
      , cameraDir = game.cameraVector()
      , origin = new THREE.Vector3()
      , direction = new THREE.Vector3()
      , near = 0
      , far = 50

    // set origin and direction
    origin.set.apply(origin,cameraPos)
    direction.set.apply(direction,cameraDir)

    // cast a ray in the orientation of the camera
    var ray = new THREE.Raycaster( origin, direction, near, far )
    var hits = ray.intersectObjects( game.scene.children, true )
    // Get the root ancestor of the first object that we hit
    var firstHit = hits[0]

    // abort if no hit
    if (!firstHit) return

    var rootHit = _findRootParent(firstHit.object)

    return rootHit.entity

  }

  // add an entity to the scene
  function _addNpc(npcData) {
    var uuid = npcData.uuid
      , skinName = npcData.skinName
      , pos = npcData.pos
      , THREE = client.game.THREE
    // create npc object
    var npc = skin(THREE, skinName, {
      scale: new THREE.Vector3(0.04, 0.04, 0.04)
    })
    var npcMesh = npc.mesh
    npcMesh.children[0].position.y = 10
    client.game.scene.add(npcMesh)
    // create entity for npc
    var newEntity = extend({},npcData,{
      object: npcMesh,
      npc: npc,
    })
    npcMesh.entity = newEntity
    // remove extraneous info
    delete newEntity.pos
    delete newEntity.skinName
    // add npc to entity registry
    client.entities[uuid] = newEntity
    client.npcs[uuid] = npc
    // position npc
    npcMesh.position.set(pos[0], pos[1], pos[2])
    return npc
  }

  function _updateEntity(npcData) {
    var entity = client.entities[npcData.uuid]
    extend(entity,npcData)
  }

  // find ancestor that is an immediate child of the scene
  function _findRootParent(obj) {
    var THREE = client.game.THREE
      , next = obj.parent
    if (! (next instanceof THREE.Scene) ) {
      obj = _findRootParent(next)
    }
    return obj
  }

  // update npc state
  function _updateNpcState(uuid, update) {
    var THREE
      , lerpPercent = 1 //0.1
      , npc = client.npcs[uuid]
      , npcMesh
    
    if (!client.game) return
    if (!npc) return

    THREE = client.game.THREE
    npcMesh = npc.mesh

    if (update.position) {
      var pos = new THREE.Vector3(update.position[0],update.position[1],update.position[2])
      npcMesh.position.copy(npcMesh.position.lerp(pos, lerpPercent))
    }
    if (update.rotation) {
      var rot = new THREE.Vector3(update.rotation[0],update.rotation[1],update.rotation[2])
      npcMesh.children[0].rotation.y = rot.y + (Math.PI / 2)
      npc.head.rotation.z = scale(rot.x, -1.5, 1.5, -0.75, 0.75)
    }
  }
   
}

// utility - scale a vector
function scale( x, fromLow, fromHigh, toLow, toHigh ) {
  return ( x - fromLow ) * ( toHigh - toLow ) / ( fromHigh - fromLow ) + toLow
}