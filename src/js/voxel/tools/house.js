// Make stairs
 
var pos = hitBlock.slice()

var width = 8

var xmax = width
var ymax = width
var zmax = width

for (var x=0;x<xmax;x++)
{
  for (var y=0;y<ymax;y++)
  {
    for (var z=0;z<zmax;z++)
    {
      var fillBlock = false
      
      // walls
      if (x==0 || x==(xmax-1)) fillBlock = true
      if (z==0 || z==(zmax-1)) fillBlock = true
      if (y==0 || y==(ymax-1)) fillBlock = true
      
      // door
      var doorx = Math.floor(xmax/2)
      if ((x==doorx || x==doorx+1) && z==0 && (y<(ymax/2) && y!=0)) fillBlock = false

      // set voxel
      if (fillBlock) {
        var newPos = pos.slice()
        newPos[0] += x
        newPos[1] += y
        newPos[2] += z
        setBlock(newPos,avatar.currentMaterial)
      }
    }
  }
}