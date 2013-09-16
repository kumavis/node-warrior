//teleport on top of the selected block

// copy hit position
var pos = hitBlock.slice()
// increase `y` by one
pos[1] += 1
// set player position
avatar.position.set(pos[0],pos[1],pos[2])