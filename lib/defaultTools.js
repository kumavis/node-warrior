var fs = require('fs')
var compile = require('./codeBeam.js').compile

// this section repeats `readFileSync` so as to utilize `brfs` to inline the sources
var toolSources = {
  mine: fs.readFileSync(__dirname + '/tools/mine.js'),
  change: fs.readFileSync(__dirname + '/tools/change.js'),
}

var defaultTools = module.exports = Object.keys(toolSources).map(function(toolName) {
  return createTool(toolName,toolSources[toolName].toString())
})

function createTool(name, code) {
  return {
    name: name,
    code: code,
    func: compile(code),
  }
}