var hat = require('hat')
  , extend = require('extend')
  , skin = require('minecraft-skin')

module.exports = function(client) {
 
  // store modvoxes on the client
  client.entities = {}

  // register incomming entities
  client.connection.on('npc',function(npcData) {
    // Update Entity
    if (npcData.uuid in client.entities) {
      console.log('STUB - update npc data')
    // New Entity
    } else {
      _addNpc(npcData)
    }
  })

  // expose api for consumer
  return {
    createNpc: createNpc,
    selectEntity: selectEntity,
  }

  // create an entity
  function createNpc(skinName,pos) {
    var pos = pos || [0,1,0]
    var npcData = {uuid: hat(), pos: pos, skinName: skinName}
    client.connection.emit('npc',npcData)
    var npc = _addNpc(npcData)
    return npc
  }

  // add an entity to the scene
  function _addNpc(npcData) {
    var uuid = npcData.uuid
      , skinName = npcData.skinName
      , pos = npcData.pos
      , filePath = /*client.settings.texturePath+*/skinName
      , THREE = client.game.THREE
    // create npc object
    var npc = skin(THREE, filePath, { scale: new THREE.Vector3(0.04, 0.04, 0.04) }).createPlayerObject()
    // add npc to entity registry
    var newEntity = {
      uuid: uuid,
      object: npc,
    }
    npc.entity = newEntity
    client.entities[uuid] = newEntity
    // add to scene
    client.game.scene.add(npc)
    // position npc
    npc.position.set(pos[0], pos[1], pos[2])
    return npc
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
    var rootHit = findRootParent(firstHit.object)

    return rootHit.entity

  }

  // find ancestor that is an immediate child of the scene
  function findRootParent(obj) {
    var THREE = client.game.THREE
      , next = obj.parent
    if (! (next instanceof THREE.Scene) ) {
      obj = findRootParent(next)
    }
    return obj
  }
   
}