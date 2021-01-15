var fs = require('fs')
var compile = require('./codeBeam.js').compile

// this section repeats `readFileSync` so as to utilize `brfs` to inline the sources
var toolSources = {
  mine: fs.readFileSync(__dirname + '/tools/mine.js'),
  activate: fs.readFileSync(__dirname + '/tools/activate.js'),
  modvox: fs.readFileSync(__dirname + '/tools/modvox.js'),
  change: fs.readFileSync(__dirname + '/tools/change.js'),
  stairs: fs.readFileSync(__dirname + '/tools/stairs.js'),
  house: fs.readFileSync(__dirname + '/tools/house.js'),
  teleport: fs.readFileSync(__dirname + '/tools/teleport.js'),
  npc: fs.readFileSync(__dirname + '/tools/npc.js'),
  grow: fs.readFileSync(__dirname + '/tools/grow.js'),
}

// convert source files to tool objects
var defaultTools = Object.keys(toolSources).map(function(toolName) {
  return createTool(toolName,toolSources[toolName].toString())
})

// add on empty tools until there are ten total
while (defaultTools.length<10) {
  defaultTools.push(createEmptyTool())
}

module.exports = defaultTools

function createTool(name, code) {
  return {
    name: name,
    code: code,
    func: compile(code),
  }
}

function createEmptyTool(name, code) {
  return createTool('','//write your own tool here')
}