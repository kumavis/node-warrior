var hat = require('hat')
  , extend = require('extend')
  , skin = require('minecraft-skin')

var __errorSkinTexture = 'error.png'

module.exports = function(client) {
 
  // store entities and npcs on the client
  // entity is any object with postion, direction, and an update loop
  client.entities = {}
  client.npcs = {}

  // register incomming entities
  client.connection.on('entity',function(npcData) {
    // Update Entity
    if (npcData.uuid in client.entities) {
      _updateEntity(npcData)
    // New Entity
    } else {
      _addNpc(npcData)
    }
  })

  // on game loop, animate entity position and rotation
  client.game.on('tick', function(delta) {
    var THREE = client.game.THREE
    var lerpPercent = Math.min(delta/100,1)
    var npcUuids = Object.keys(client.npcs)
    npcUuids.map(function(uuid) {
      var npc = client.npcs[uuid]
      var object3D = npc.mesh
      var pos = new THREE.Vector3(npc.pos[0],npc.pos[1],npc.pos[2])
      var rot = new THREE.Vector3(npc.rot[0],npc.rot[1],npc.rot[2])
      // lerp position
      object3D.position.lerp(pos, lerpPercent)
      // lerp rotation
      var targetBodyRot = rot.clone().add(new THREE.Vector3(0,Math.PI/2,0))
      object3D.children[0].rotation.y = object3D.children[0].rotation.clone().lerp(targetBodyRot, lerpPercent).y
      var targetHeadRot = npc.head.rotation.clone().setZ(scale(rot.x, -1.5, 1.5, -0.75, 0.75))
      npc.head.rotation.z = npc.head.rotation.clone().lerp(targetHeadRot, lerpPercent).z
    })
  })

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
    client.connection.emit('entity',npcData)
    var npc = _addNpc(npcData)
    return npc
  }

  // update an entity
  function updateEntity(npcData) {
    if (!npcData.uuid) throw 'no uuid specified'
    if (!npcData.uuid in client.entities) throw 'no entity with specified uuid: '+npcData.uuid
    client.connection.emit('entity',npcData)
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
    // add npc to entity registry
    client.entities[uuid] = newEntity
    client.npcs[uuid] = npc
    // position npc
    var pos = npc.pos = npcData.pos || [0,0,0]
    var rot = npc.rot = npcData.rot || [0,0,0]
    npcMesh.position.set(pos[0], pos[1], pos[2])
    // if starting in error state, repaint npc as error
    if (npcData.state === 'error') _entityEnteredErrorState(newEntity)
    return npc
  }

  function _updateEntity(npcData) {
    var uuid = npcData.uuid
    var entity = client.entities[uuid]
    if (npcData.state && npcData.state === 'error' && entity.state !== 'error') _entityEnteredErrorState(entity)
    if (npcData.state && npcData.state !== 'error' && entity.state === 'error') _entityLeftErrorState(entity)
    // animate position and rotation, then remove their details so they are not set instantly
    _updateNpcState(uuid,npcData)
    delete npcData.position
    delete npcData.rotation
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

    if (update.position) npc.pos = update.position
    if (update.rotation) npc.rot = update.rotation
  }
   
}

function _entityEnteredErrorState(entity) {
  var uuid = entity.uuid
  console.log('entity errored:',uuid)
  var npc = client.npcs[uuid]
  npc.fetchImage(__errorSkinTexture)
}

function _entityLeftErrorState(entity) {
  var uuid = entity.uuid
  console.log('entity restored:',uuid)
  var npc = client.npcs[uuid]
  var entity = client.entities[uuid]
  npc.fetchImage(entity.skinName)
}

// utility - scale a vector
function scale( x, fromLow, fromHigh, toLow, toHigh ) {
  return ( x - fromLow ) * ( toHigh - toLow ) / ( fromHigh - fromLow ) + toLow
}