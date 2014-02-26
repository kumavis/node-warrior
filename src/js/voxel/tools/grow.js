// Grow or shrink


var size = avatar.avatar.scale.y

if (secondaryClick) {
  size /= 2
} {
  size *= 2  
}

avatar.avatar.scale.set(size,size,size)
