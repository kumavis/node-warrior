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


module.exports = Client

function Client(opts) {
  // force instantiation via `new` keyword 
  if(!(this instanceof Client)) { return new Client(opts) }
  this.initialize(opts)
}

Client.prototype.initialize = function(opts) {
  var self = this

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

  self.modvoxes = {}
  connection.on('modvox',function(pos,code) {
    self.modvoxes[pos.join('|')] = code
  })

}

Client.prototype.bindClientEvents = function() {
  var self = this
  var baseClient = self.baseClient
  
  // When client is ready
  baseClient.on('loadComplete', function() {
    console.log('got initial chunks')
    // render game in browser window
    var game = baseClient.game
    game.appendTo(self.settings.container)
    
    window.game = game
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
  codeEditor.initialize(game)
  codeBeam.initialize(codeEditor)

  // re-position the player if they fall off the screen
  rescue(game, {  
    dangerZone: {
      lower: {x: -Infinity, y: -Infinity, z: -Infinity},
      upper: {x: Infinity, y: -20, z: Infinity}
    },
    startingPosition: game.settings.avatarInitialPosition,
  })

  // highlight blocks when you look at them, hold <Ctrl> for block placement
  var blockPosPlace, blockPosErase
  var hl = game.highlighter = highlight(game, { color: 0xff0000 })
  hl.on('highlight', function (voxelPos) { blockPosErase = voxelPos })
  hl.on('remove', function (voxelPos) { blockPosErase = null })
  hl.on('highlight-adjacent', function (voxelPos) { blockPosPlace = voxelPos })
  hl.on('remove-adjacent', function (voxelPos) { blockPosPlace = null })

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
    codeBeam.setCurrentTool(newTool)
  })
  toolSelector.switchToolbar(0)

  // game click event
  game.on('fire', function (target, state) {
    codeBeam.runCode({
      game: game,
      avatar: avatar,
      hitBlock: blockPosPlace || blockPosErase,
      secondaryClick: !!blockPosPlace,
      setBlock: setBlock,
      client: self,
    })
  })
 
  // setBlock method for codeBeam
  function setBlock( position, value ) {
    // set local
    game.setBlock(position, value)
    // set remote
    connection.emit('set', position, value)
  }
}