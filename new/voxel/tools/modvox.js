// click to activate a modvox, control-click to place modvox

if (secondaryClick) {
  // color box
  setBlock(hitBlock,11)
  // default code
  var code = "alert('i haz a modvox')"
  // create modvox
  setModVox(hitBlock,code)
  // open modvox in editor
  openModVox(hitBlock)
} else {
  // open modvox in editor
  openModVox(hitBlock)
}