// click to remove block, control-click to place block
if (neighborBlock) {
  setBlock(neighborBlock, avatar.currentMaterial)
} else if (hitBlock) {
  setBlock(hitBlock, 0)
}