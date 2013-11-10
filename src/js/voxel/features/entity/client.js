var hat = require('hat'),
    extend = require('extend'),
    skin = require('minecraft-skin')

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
    var npc = skin(THREE, filePath, {scale: new THREE.Vector3(0.04, 0.04, 0.04)}).createPlayerObject()
    // add npc to entity registry
    client.entities[uuid] = npc
    // add to scene
    client.game.scene.add(npc)
    // position npc
    npc.position.set(pos[0], pos[1], pos[2])
    return npc
  }

  // // open a modvox in the editor
  // function openModVox(pos) {
  //   // skip if no modvox at pos
  //   if (undefined === client.entities[pos.join('|')]) return
  //   // get code from modvox
  //   var code = client.entities[pos.join('|')]
  //   // open code in editor
  //   client.codeEditor.open(code,function(newCode) {
  //     // update code in modvox when done
  //     setModVox(pos,newCode)
  //   })
  // }

  // function prepareForTransmission(entity) {
  //   // an empty object to fill with basic info
  //   var copy = {}
  //   // remove parent
  //   delete copy.parent
  //   // repeat process for children
  //   copy.children.map(function(child,index) {
  //     copy.children[index] = prepareForTransmission(child)
  //   })
  //   return copy
  // }
  
}