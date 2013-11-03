// Clear world
clearRange([-64,0,-64],[31,50,31])


function clearRange(start,end) {

  var xmin = start[0], xwidth = end[0]-start[0]
  var ymin = start[1], ywidth = end[1]-start[1]
  var zmin = start[2], zwidth = end[2]-start[2]

  var i = 0
  for (var y=ymin;y<ywidth;y++)
  {
    for (var x=xmin;x<xwidth;x++)
    {
      for (var z=zmin;z<zwidth;z++)
      {
        if (getBlock([x,y,z])) {
          i++
          clearBlock(x,y,z,i*100)
        }
      }
    }
  }

}

function clearBlock(x,y,z,timeout) {
  setTimeout(function(timeout){
    console.log([x,y,z])
    setBlock([x,y,z],0)
  },1000)
}