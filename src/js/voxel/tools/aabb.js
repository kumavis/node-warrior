// make a spatial trigger

// options
var size = 10
// calculate bottom corner pos
var pos = [hitBlock[0]-size/2,hitBlock[1],hitBlock[2]-size/2]

// create AABB
createSpatialTrigger(pos,[size,size,size],enter,exit)

// set block initial color
exit()

// enter AABB handler
function enter() {
  console.log('enter')
  setBlock(hitBlock,13)
}

// exit AABB handler
function exit() {
  console.log('exit')
  setBlock(hitBlock,12)
}