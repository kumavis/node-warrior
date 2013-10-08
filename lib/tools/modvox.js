// click to activate a modvox, control-click to place modvox

if (secondaryClick) {
  setBlock(hitBlock,11)
  var code = "console.log('i haz a modvox')"
  client.modvoxes[hitBlock.join('|')] = code
  client.connection.emit('modvox',hitBlock,code)
} else {
  var code = client.modvoxes[hitBlock.join('|')]
  // what could possibly go wrong??
  eval(code)
}