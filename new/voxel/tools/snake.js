// Make a Snake
// Danger! - snakes are dangerous
// they eat everything in their path and can't be stopped

// configurations
var snakeLength = 13
var moveFrequency = 7
var bodyMaterial = avatar.currentMaterial
var headMaterial = bodyMaterial+1

// unleash the beast
setInterval(next,100)

// 6 possible directions ( 3 axis * 2 signs +/- )
directions = [
  [+1,0,0], [-1,0,0],
  [0,+1,0], [0,-1,0],
  [0,0,+1], [0,0,-1],
]

// configurations
var pos = hitBlock.slice()
var snakeBody = []
var moveDirection = directions[2]
var movesSinceLastTurn = 0

// one step of the animation process
function next() {

  // choose a random direction
  if (movesSinceLastTurn>moveFrequency) {
    moveDirection = newDirection(moveDirection)
    movesSinceLastTurn = 0
  }
  // choose target pos
  pos = addPos(pos,moveDirection)
  
  // set block in world and register move
  setBlock(pos,headMaterial)
  movesSinceLastTurn++

  // change previous head voxel to body material
  if (snakeBody.length>0) {
    var previousHeadPos = snakeBody.slice(-1)[0]
    setBlock(previousHeadPos,bodyMaterial)
  }

  // add new head to body
  snakeBody.push(pos)

  // if snake too long, remove tail voxel
  if (snakeBody.length>snakeLength) {
    var tailPos = snakeBody.shift()
    setBlock(tailPos,0)
  }
}

// add two x,y,z triplets together
function addPos(p0,p1) {
  newPos = p0.slice()
  newPos[0] += p1[0]
  newPos[1] += p1[1]
  newPos[2] += p1[2]
  return newPos
}

// gives a directional x,y,z triplet, not the same or reverse direction of the provided one
function newDirection(oldDir) {
  // get direction index
  var dirIndex = directions.indexOf(oldDir)
  // we get the index of the axis-positive version of the direction
  var dirPosIndex = Math.floor(dirIndex/2)*2
  // choose one of 4 possible target directions ( left, right, up, down )
  var targetIndex = (dirPosIndex+randomInt(2,6))%directions.length
  // for 1:[+1,0,0] anything but 0:[+1,0,0], 1:[-1,0,0]
  // for 3:[0,-1,0] anything but 2:[0,+1,0], 3:[0,-1,0]
  return directions[targetIndex]
}

// a random integer from 0 (inclusive) to `upper` (not inclusive)
function randomInt(lower,upper) {
  return Math.floor(Math.random()*(upper-lower))+lower
}
