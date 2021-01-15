// Create or Edit an NPC

// Create Entity
if (secondaryClick) {

  // copy hit location
  var pos = hitBlock.slice()
  // create npc
  var maxogden = createNpc('player.png',pos)

// Modify Entity
} else {

  var entity = selectEntity()
  if (entity) {
    // open code in editor
    client.codeEditor.open(entity.update, function(newCode) {
      // update entity code when done
      updateEntity({
        uuid: entity.uuid,
        update: newCode,
      })
    })  
  }

}
