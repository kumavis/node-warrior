var Through = require('through')
var treeify = require('treeify').asTree

module.exports = StreamSpy


function StreamSpy(name){
  return Through(function(data) {
    var message = ('spy('+name+'):\n'+treeify(arguments,true)).slice(0,-1)
    console.log(message)
    this.emit('data', data)
  })
}