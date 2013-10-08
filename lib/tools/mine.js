// click to remove block, control-click to place block
if (!hitBlock) return

if (secondaryClick) {
  setBlock(hitBlock, avatar.currentMaterial)
} else {
  setBlock(hitBlock, 0)
}