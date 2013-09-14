// external dependencies
var extend = require('extend')
var toolbar = require('toolbar')

// voxel dependencies
var createClient = require('voxel-client')
var highlight = require('voxel-highlight')
var voxelPlayer = require('voxel-player')

// internal dependencies
var codeBeam = require('./codeBeam.js')
var codeEditor = require('./codeEditor.js')
var playerTools = require('./defaultTools.js')

// module globals
module.exports = initialize

function initialize(opts, setup) {  
  setup = setup || defaultSetup
  opts = extend({}, opts || {})

  var client = createClient(opts.server || "ws://localhost:8080/")  
  
  client.emitter.on('noMoreChunks', function(id) {
    console.log("Attaching to the container and creating player")
    var container = opts.container || document.body
    var game = client.game
    // for debugging
    window.game = game
    game.appendTo(container)
    if (game.notCapable()) return game
    
    var createPlayer = voxelPlayer(game)

    // create the player from a minecraft skin file and tell the
    // game to use it as the main player
    var avatar = createPlayer('player.png')
    avatar.possess()
    var settings = game.settings.avatarInitialPosition
    avatar.position.set(settings[0],settings[1],settings[2])
    setup(game, avatar, client)

  })


}

function defaultSetup(game, avatar, client) {
  // initialize code editor
  codeEditor.initialize(game)
  codeBeam.initialize(codeEditor)

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

  // setup toolbars
  // blocks
  var blockSelector = toolbar({ el: '#blocks' })
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
  // "tools", interaction modes
  var toolSelector = toolbar({ el: '#tools', toolbarKeys: ['comma','period','forwardslash'] })
  toolSelector.setContent(playerTools.map(function(tool,index){
    return {
      id: index,
      label: tool.name,
    }
  }))
  toolSelector.on('select',function(selection){
    codeBeam.setCurrentTool(playerTools[selection])
  })
  toolSelector.switchToolbar(0)

  // game click event
  game.on('fire', function (target, state) {
    codeBeam.runCode({
      game: game,
      avatar: avatar,
      hitBlock: blockPosErase,
      neighborBlock: blockPosPlace,
      setBlock: setBlock,
    })
  })
 
  function setBlock( position, value ) {
    // set local
    game.setBlock(position, value)
    // set remote
    client.emitter.emit('set', position, value)
  }
}