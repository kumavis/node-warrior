module.exports = function(client) {
 
  // store modvoxes on the client
  client.modvoxes = {}

  // register incomming modvoxes
  client.connection.on('modvox',function(pos,code) {
    client.modvoxes[pos.join('|')] = code
  })

  return {
    setModVox: setModVox,
    openModVox: openModVox,
  }

  // create or overwrite a modvox
  function setModVox(pos,code) {
    // set locally
    client.modvoxes[pos.join('|')] = code
    // send remotely
    client.connection.emit('modvox',pos,code)
  }
      

  // open a modvox in the editor
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
  
}