// external dependencies
var extend = require('extend')

// voxel dependencies
var createClient = require('voxel-client')
var highlight = require('voxel-highlight')
var voxelPlayer = require('voxel-player')

// internal dependencies
var codeEditor = require('./codeEditor.js')

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
    window.avatar = avatar
    avatar.possess()
    var settings = game.settings.avatarInitialPosition
    avatar.position.set(settings[0],settings[1],settings[2])
    setup(game, avatar, client)
  })


}

function defaultSetup(game, avatar, client) {
  // initialize code editor
  codeEditor.initialize(game)

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

  // block interaction stuff, uses highlight data
  var currentMaterial = 1

  game.on('fire', function (target, state) {
    var position = blockPosPlace
    if (position) {
      game.createBlock(position, currentMaterial)
      client.emitter.emit('set', position, currentMaterial)
    } else {
      position = blockPosErase
      if (position) {
        game.setBlock(position, 0)
        console.log("Erasing point at " + JSON.stringify(position))
        client.emitter.emit('set', position, 0)
      }
    }
  })
}