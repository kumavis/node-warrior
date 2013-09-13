var self = module.exports  = {

  initialize: function(codeEditor) {
    self.jsEditor = codeEditor.jsEditor
  },
  
  // Handle executing code
  runCode: function(environment) {
    var environment = environment || {}

    // bring environment keys into scope
    var preamble = Object.keys(environment)
                         .map(function(key){ return 'var '+key+' = environment.'+key+';' })
                         .join('\n')
                         + "\n\n//======= end of preamble ========\n\n"

    // get user code
    var userCode = self.jsEditor.getValue()
    console.log('running code:\n',userCode)

    // prepare code
    var code = preamble + userCode

    eval(code)
  },

}