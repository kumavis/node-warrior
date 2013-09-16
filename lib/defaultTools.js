var fs = require('fs')
var compile = require('./codeBeam.js').compile

// this section repeats `readFileSync` so as to utilize `brfs` to inline the sources
var toolSources = {
  mine: fs.readFileSync(__dirname + '/tools/mine.js'),
  change: fs.readFileSync(__dirname + '/tools/change.js'),
  stairs: fs.readFileSync(__dirname + '/tools/stairs.js'),
  teleport: fs.readFileSync(__dirname + '/tools/teleport.js'),
}

// convert source files to tool objects
var defaultTools = module.exports = Object.keys(toolSources).map(function(toolName) {
  return createTool(toolName,toolSources[toolName].toString())
})

// add on empty tools until there are ten total
while (defaultTools.length<10) {
  defaultTools.push(createEmptyTool())
}

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