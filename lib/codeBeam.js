// variables exposed on the environment
var envVars = [
  'game',
  'avatar',
  'hitBlock',
  'secondaryClick',
  'setBlock',
  'client',
]

var self = module.exports = {

  currentTool: null,

  initialize: function(codeEditor) {
    self.jsEditor = codeEditor.jsEditor
    self.jsEditor.on('valid',function(noErrors) {
      if (noErrors) {
        var source = self.jsEditor.getValue()
        self.currentTool.code = source
        self.currentTool.func = self.compile(source)
      }
    })
  },
  
  setCurrentTool: function(tool) {
    self.currentTool = tool
    self.jsEditor.setValue(tool.code)
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