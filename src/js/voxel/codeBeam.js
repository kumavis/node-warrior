// variables exposed on the environment
var envVars = [
  'game',
  'avatar',
  'hitBlock',
  'secondaryClick',
  'setBlock',
  'getBlock',
  'client',
  'require',
  'createSpatialTrigger',
  'createEntity',
  'selectEntity',
  'setModVox',
  'openModVox',
  'createEntity',
  'createNpc',
]

var self = module.exports = {

  currentTool: null,

  initialize: function(codeEditor) {
    self.codeEditor = codeEditor
    return self
  },
  
  setCurrentTool: function(tool) {
    self.currentTool = tool
    // if code editor open, switch to the new tool
    if (self.codeEditor.isOpen) self.editTool(tool)
  },

  // open the code editor to modify this tool
  editTool: function(tool) {
    // default to current tool
    tool = tool || self.currentTool
    // open code editor tool's code
    self.codeEditor.open(tool.code,function(newCode) {
      // update tool's code on close
      tool.code = newCode
      tool.func = self.compile(newCode)
    })
  },

  // Handle executing code
  runCode: function(environment) {
    console.log('running code:\n',self.currentTool.code)
    self.currentTool.func(environment)
  },

  compile: function(userCode) {
    // bring environment keys into scope
    var preamble = envVars.map(function(key){ return 'var '+key+' = environment.'+key+';' })
                            .join('\n')
                            + '\n\n//======= end of preamble ========\n\n'

    var code = preamble + userCode
    // compile function
    var compiledFunc
    eval('compiledFunc = function(environment) {\n'+code+'\n}')
    return compiledFunc
  },

}