
// TODO: expose current chunk to entity? - then expose block querying API
// TODO: switch over to webworker, and fix inevitable comms problems
// TODO: converge npc and entity terms

var fs = require('fs')
var extend = require('extend')

// work around for issue https://github.com/maxogden/browser-module-sandbox/issues/2
var XHR = window.XMLHttpRequest
var Sandbox = require('browser-module-sandbox')
window.XMLHttpRequest = XHR

    
var __sandboxOpts = {
  cdn: 'http://wzrd.in',
  container: document.head,
}

/*
Entity
  - uuid (string)
  - state (string)
  - pos (arrayVector)
  - rot (arrayVector)
  - update (code string)
*/

module.exports = function(server) {
  // get database access
  var database = server.voxelDb.db
  // store entities in memory
  var entities = server.entities =  {}
  var entitySandboxes = server.entitySandboxes = {}
  // get entities from db
  loadEntitiesFromStore()
  // setup listeners
  bindEvents()
  // awaken entities
  startAnimation()

  // debug !! debug
  window.handleEntityUpdate = handleEntityUpdate

  function bindEvents() {
    // set npc
    server.baseServer.on('entity',handleEntityUpdate)
    // send npcs on join
    server.baseServer.on('client.created',sendInitialEntities)
    // listen for messages from entities
    addEventListener('message',entityMessageReceiver)
  }

  // load new entities or update exisiting ones
  function handleEntityUpdate(npcData) {
    console.log('npc incomming!',npcData)
    var uuid = npcData.uuid
    var entity = entities[uuid]
    updateEntity(npcData)
    updateEntityStore()
  }

  // send all existing entities to new player
  function sendInitialEntities(client) {
    Object.keys(entities).map(function(uuid) {
      var npcData = entities[uuid]
      client.connection.emit('entity',npcData)
    })
  }

  // handle response from entity execution sandbox
  function entityMessageReceiver(event) {
    // validate that this is an entityMessage
    if (-1 === event.data.indexOf('entityMessage')) return
    var message = JSON.parse(event.data)
    var uuid  = message.uuid
    var entity = entities[uuid]
    switch (message.type) {
      case 'error':
        var value = message.value
        setEntityState(entity,'error')
        console.log('an entity threw an error -',uuid,value)
        break
      case 'setPosition':
        var value = message.value
        setPosition(entity,value)
        break
      case 'setRotation':
        var value = message.value
        setRotation(entity,value)
        break
      case 'move':
        var value = message.value
        move(entity,value)
        break
      case 'rotate':
        var value = message.value
        rotate(entity,value)
        break
    }
  }

  // set entity state locally, then broadcast
  function setEntityState(entity,state) {
    entity.state = state
    server.baseServer.broadcast('server','entity',{uuid:entity.uuid, state:state})
  }

  // get npcs from db and load
  function loadEntitiesFromStore(storageString) {
    database.get('entities',function(err,storageString) {
      if (err && err.name !== 'NotFoundError') throw err
      var entitiesHash = storageString ? JSON.parse(storageString) : {}
      Object.keys(entitiesHash).map(function(entityId){
        var entityHash = entitiesHash[entityId]
        updateEntity(entityHash)
      })
    })
  }

  // load a single npc
  function updateEntity(entityHash) {
    var uuid = entityHash.uuid
    // in the future we might do something between instantiation and deserialization
    var entity = entities[uuid] || {}
    extend(entity,entityHash)
    setEntityState(entity,'loaded')
    entities[uuid] = entity
    // if sandbox not available create a new one
    var sandbox = entitySandboxes[uuid] = entitySandboxes[uuid] || Sandbox(__sandboxOpts)
    // if update function provided, generate entity bundle
    if (entity.update) {
      var code = fs.readFileSync(__dirname+'/entityBundle.js.hbs')
        .replace('{{uuid}}',uuid)
        .replace('{{user_code}}',entity.update)
      // work around for https://github.com/maxogden/browser-module-sandbox/issues/4
      if (-1 === code.indexOf('require(')) code = 'require("os")\n\n'+code
      // activate entity when bundle is ready
      sandbox.once('bundleEnd',function(){
        setEntityState(entity,'active')
      })
      // start sandbox
      // TODO: delay here b/c db not ready(?)
      setTimeout(function(){
        sandbox.bundle(code)      
      },1000)
    }
  }

  // store entities in db
  function updateEntityStore() {
    var storageString = JSON.stringify(entities)
    database.put('entities',storageString)
  }

  function startAnimation() {
    // start animating entities
    setTimeout(animateEntities,500)
  }

  // step through entities and animate
  function animateEntities() {
    Object.keys(entities).map(function(uuid) {
      var entity = entities[uuid]
      if (entity.update && entity.state === 'active') {
        triggerEntityUpdate(entity)
      }
    })
    setTimeout(animateEntities,500)
  }

  // run code an entity function
  function triggerEntityUpdate(entity) {
    var sandbox = entitySandboxes[entity.uuid]
    sandbox.iframe.iframe.contentWindow.postMessage('update:'+entity.uuid,'*')
  }

  // entity API

  function setPosition(entity,arrayVector) {
    entity.pos = arrayVector
    server.baseServer.broadcast('server', 'entity', {uuid: entity.uuid, position: arrayVector})
  }

  function setRotation(entity,arrayVector) {
    entity.rot = arrayVector
    server.baseServer.broadcast('server', 'entity', {uuid: entity.uuid, rotation: arrayVector})
  }

  function move(entity,arrayVector) {
    var pos = entity.pos.slice()
    pos[0] += arrayVector[0]
    pos[1] += arrayVector[1]
    pos[2] += arrayVector[2]
    setPosition(entity,pos)
  }

  function rotate(entity,arrayVector) {
    var rot = entity.rot.slice()
    rot[0] += arrayVector[0]
    rot[1] += arrayVector[1]
    rot[2] += arrayVector[2]
    setRotation(entity,rot)
  }

}