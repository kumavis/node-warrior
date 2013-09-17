// Make a Snake
// Danger! - snakes are dangerous
// they eat everything in their path and can't be stopped

var pos = hitBlock.slice()
var snakeBody = []
var snakeLength = 13
var bodyMaterial = avatar.currentMaterial
var headMaterial = bodyMaterial+1

setInterval(next,100)

function next() {
  // get random neighbor voxel
  pos = randomMove(pos)
  
  // if pos not part of snake, add to snake body and world
  if (snakeBody.indexOf(pos.join('|')) === -1) {
    setBlock(pos,headMaterial)
    // change previous head voxel to body material
    if (snakeBody.length>0) {
      var previousHeadPos = snakeBody.slice(-1)[0].split('|')
      setBlock(previousHeadPos,bodyMaterial)
    }
    // add head to body
    snakeBody.push(pos.join('|'))
  }

  // if snake too long, remove tail voxel
  if (snakeBody.length>snakeLength) {
    var tailPos = snakeBody.shift().split('|')
    setBlock(tailPos,0)
  }
}

function randomMove(p0) {
  newPos = p0.slice()
  newPos[randomInt(3)] += 2*randomInt(2)-1
  return newPos
}

function randomInt(upper) {
  return Math.floor(Math.random()*upper)
}
