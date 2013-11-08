//write your own tool here
var cameraPos = game.cameraPosition()
    cameraDir = game.cameraVector()
    origin = new game.THREE.Vector3(),
    direction = new game.THREE.Vector3(),
    near = 0,
    far = 50

// set origin and direction
origin.set.apply(origin,cameraPos)
direction.set.apply(direction,cameraDir)

var ray = new game.THREE.Raycaster( origin, direction, near, far )
var hits = window.hits = ray.intersectObjects(game.scene.children,true)

var rootHits = window.rootHits = 
  hits
    .map(function(hit){ return hit.object })
    .map(findRootParent)

console.log(ray)
console.log(hits)
console.log(rootHits)

// remove first root hit mesh
hit = rootHits[0]
hit && hit.parent.remove(hit)
// rootHits.map(function(hit){
//   hit.parent.remove(hit)
// })

function findRootParent(obj) {
  var next = obj.parent
  if (! (next instanceof game.THREE.Scene) ) {
    obj = findRootParent(next)
  }
  return obj
}

// d=this.ray.direction;z = new game.THREE.Vector3(d[0],d[1],d[2])
// z.set.apply(z,d)

// a.object.parent.parent.parent.parent.parent instanceof game.THREE.Scene