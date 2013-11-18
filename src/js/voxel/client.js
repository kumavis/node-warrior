// external dependencies
var extend = require('extend')
var toolbar = require('toolbar')
// voxel dependencies
var createClient = require('voxel-client')
var highlight = require('voxel-highlight')
var rescue = require('voxel-rescue')
// internal dependencies
var chat = require('./chat.js')
var codeBeam = require('./codeBeam.js')
var codeEditor = require('./codeEditor.js')
var playerTools = require('./defaultTools.js')
// internal features
var modvox = require('./features/modvox/client.js')
var entity = require('./features/entity/client.js')
// some extra modules exposed for the gun
require('minecraft-skin')
var trigger = require('spatial-trigger')
var aabb = require('aabb-3d')

module.exports = Client

function Client(opts) {
  // force instantiation via `new` keyword 
  if(!(this instanceof Client)) { return new Client(opts) }
  this.initialize(opts)
}

Client.prototype.initialize = function(opts) {
  var self = this

  // for debugging
  window.client = self

  var defaults = {
    container: document.body,
    texturePath: '/textures/',
    playerTexture: 'player.png'
  }
  var settings = self.settings = extend({}, defaults, opts)

  // create the base game client
  self.connection = settings.connection
  self.baseClient = createClient(settings)

  // bind events
  self.bindServerEvents()
  self.bindClientEvents()

  // add features
  self.modvox = modvox(self)
  self.entity = entity(self)
}

Client.prototype.bindServerEvents = function() {
  var self = this
  var connection = self.connection

  // receive id from server 
  connection.on('id', function(id) {
    console.log('got id', id)
  })

  // receive game settings from server
  connection.on('settings', function(id) {
    console.log('got settings')
  })

  // show a message in the chat window when a remote client joins
  connection.on('join',function(user) {
    var message = user + ' joined.'
    self.chat.showMessage(message)
  })

  // show a message in the chat window when a remote client leaves
  connection.on('leave',function(user) {
    var message = user + ' left.'
    self.chat.showMessage(message)
  })

  self.spatialTriggers = []
  connection.on('spatialTrigger',function(spatialTrigger) {
    // deserialize handlers
    spatialTrigger.enter = eval('(function(){ return '+spatialTrigger.enter+' })()') || function(){}
    spatialTrigger.exit = eval('(function(){ return '+spatialTrigger.exit+' })()') || function(){}
    // after load
    self.baseClient.on('loadComplete', function() {
      // load trigger into world
      self._createSpatialTrigger(spatialTrigger)
    })
  })

}

Client.prototype.bindClientEvents = function() {
  var self = this
  var baseClient = self.baseClient
  
  // When client is ready
  baseClient.on('loadComplete', function() {
    console.log('got initial chunks')
    // render game in browser window
    var game = self.game = baseClient.game
    game.appendTo(self.settings.container)
    // setup app-specific game particulars
    self.setup(baseClient)
  })

  // handle error messages
  baseClient.on('error', function(err) {
    if (err == 'game not capable') {
      alert('Browser does not meet requirements, sry :(')
    } else {
      console.error(err)
    }
  })

}

Client.prototype.setup = function() {
  var self = this
  var baseClient = self.baseClient
  var game = baseClient.game
  var avatar = baseClient.avatar
  var connection = self.connection
  
  //initialize chat
  self.chat = chat({
    user: baseClient.name,
    element: document.getElementById('chat'),
    emitter: connection,
  })

  // initialize code editor
  self.codeEditor = codeEditor.initialize(game)
  self.codeBeam = codeBeam.initialize(self.codeEditor)

  // Add key binding (tilde/backtick) to toggle editor
  window.addEventListener('keydown',function(event) {
    // if key pressed is tilde key
    if (event.keyCode === 192) {
      // consume event
      event.stopPropagation()
      // when open...
      if (self.codeEditor.isOpen) {
        // close the editor
        self.codeEditor.close()
      // when closed...
      } else {
        // edit the current tool
        self.codeBeam.editTool()
      }
    }
  })

  // re-position the player if they fall off the screen
  rescue(game, {  
    dangerZone: {
      lower: {x: -Infinity, y: -Infinity, z: -Infinity},
      upper: {x: Infinity, y: -20, z: Infinity}
    },
    startingPosition: game.settings.avatarInitialPosition,
  })

  // highlight blocks when you look at them, hold <Ctrl> for block placement
  game.highlighter = highlight(game, { color: 0xff0000 })

  // toggle between first and third person modes
  window.addEventListener('keydown', function (event) {
    if (event.keyCode === 'R'.charCodeAt(0)) avatar.toggle()
  })

  //
  // setup toolbars
  //

  // block materials
  var blockSelector = toolbar({
    el: '#blocks',
    toolbarKeys: ['t','y','u','i','o','p','openbracket','closebracket','backslash',
                  'g','h','j','k','l','semicolon','singlequote']
  })
  blockSelector.setContent(game.materialNames.map(function(mat,id){
    if (Array.isArray(mat)) mat = mat[0]
    return {
      id: id+1,
      icon: 'textures/'+mat+'.png',
      label: mat,
    }
  }))
  blockSelector.on('select',function(selection){
    avatar.currentMaterial = Number(selection)
  })
  blockSelector.switchToolbar(0)
  
  // 'tools', interaction modes
  var toolSelector = toolbar({ el: '#tools' })
  toolSelector.setContent(playerTools.map(function(tool,index){
    var toolKey = (index+1)%10
    return {
      id: index,
      icon: 'img/numIcon-'+toolKey+'.gif',
      label: tool.name,
    }
  }))
  toolSelector.on('select',function(index){
    var newTool = playerTools[index]
    self.codeBeam.setCurrentTool(newTool)
  })
  toolSelector.switchToolbar(0)

  // game click event, run code
  game.on('fire', function runCode() {
    var isAltFire = Boolean(game.controls.state.alt || game.controls.state.firealt)
    game.highlighter.highlight()
    self.codeBeam.runCode({
      game: game,
      avatar: avatar,
      hitBlock: isAltFire ? game.highlighter.currVoxelAdj : game.highlighter.currVoxelPos,
      secondaryClick: isAltFire,
      client: self,
      setBlock: setBlock,
      getBlock: game.getBlock,
      require: require,
      createSpatialTrigger: createSpatialTrigger,
      openModVox: self.modvox.openModVox,
      setModVox: self.modvox.setModVox,
      createNpc: self.entity.createNpc,
      selectEntity: self.entity.selectEntity,
      updateEntity: self.entity.updateEntity,
    })
  })
 
  //
  // CodeBeam methods
  //

  // setBlock method for codeBeam, adds blocks to a queue
  var pendingBlocks = 0
  function setBlock( position, value ) {
    pendingBlocks++
    setTimeout(function(){
      pendingBlocks--
      _setBlock(position,value)
    },pendingBlocks*100)
  }
  function _setBlock (position, value ) {
    // set local
    game.setBlock(position, value)
    // set remote
    connection.emit('set', position, value)
  }

  // create spatialTrigger
  function createSpatialTrigger(pos,size,enter,exit) {
    // sanitize handlers
    if (typeof enter !== 'function') enter = function(){}
    if (typeof exit !== 'function') exit = function(){}
    self._createSpatialTrigger({
      pos: pos,
      size: size,
      enter: enter,
      exit: exit,
    })
    // send remotely
    self.connection.emit('spatialTrigger', {
      pos: pos,
      size: size,
      enter: enter.toString(),
      exit: exit.toString(),
    })
  }

}

Client.prototype._createSpatialTrigger = function(spatialTrigger) {
  var self = this,
      game = self.baseClient.game

  self.spatialTriggers.push(spatialTrigger)
  var bbox = aabb(spatialTrigger.pos, spatialTrigger.size)
  // draw AABB
  game.addAABBMarker(bbox)
  // setup callbacks
  trigger(game.spatial, bbox)
    .on('exit', spatialTrigger.exit)
    .on('enter', spatialTrigger.enter)
}