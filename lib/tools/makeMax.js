// make a max
var skin = require('minecraft-skin')

var filePath = /*client.settings.texturePath+*/'player.png'
var maxogden = skin(game.THREE, filePath, {scale: new game.THREE.Vector3(0.04, 0.04, 0.04)}).createPlayerObject()
maxogden.position.set(hitBlock[0],hitBlock[1]+1,hitBlock[2])
game.scene.add(maxogden)
