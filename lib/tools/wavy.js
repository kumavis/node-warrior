// Wavy terrain generator
for(var x = -20; x < 20; x++){
  for(var z = -20; z < 20; z++){
    setBlock([x, (Math.sin(x*0.3)+Math.cos(z*0.3))*3+10, z], avatar.currentMaterial);
  }
}