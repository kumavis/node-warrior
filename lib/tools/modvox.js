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

function setModVox(pos,code) {
  client.modvoxes[pos.join('|')] = code
  client.connection.emit('modvox',pos,code)
}

function openModVox(pos) {
  // skip if no modvox at pos
  if (undefined === client.modvoxes[pos.join('|')]) return
  // get code from modvox
  var code = client.modvoxes[pos.join('|')]
  // open code in editor
  client.codeEditor.open(code,function(newCode) {
    // update code in modvox when done
    setModVox(pos,newCode)
  })
}