// Make stairs
 
var pos
  
for (var i=0;i<10;i++)
{
  // copy hit location
  pos = hitBlock.slice()
  // increase `x` by i
  pos[0] += i
  for (var g=0;g<i;g++)
  {
    // copy `pos`
    newPos = pos.slice()
    // increase `y` by g
    newPos[1] += g
    // set the block
    setBlock(newPos,avatar.currentMaterial)
  }
 
}