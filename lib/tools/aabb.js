// make a spatial trigger
var trigger = require('spatial-trigger')
var aabb = require('aabb-3d')

// options
var size = 10

// create AABB
var pos = [hitBlock[0]-size/2,hitBlock[1],hitBlock[2]-size/2]
var bbox = aabb(pos, [size,size,size])

// draw AABB
game.addAABBMarker(bbox)

// color block
setBlock(hitBlock,12)

// setup callbacks
trigger(game.spatial, bbox)
  .on('exit', function() {
    setBlock(hitBlock,12)
    console.log('exit')
  })
  .on('enter', function() {
    setBlock(hitBlock,13)
    console.log('enter')
  })
