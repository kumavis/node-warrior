// TODO "insert actual security here"
// TODO run non-block / in different thread / worker

module.exports = function(userCode,self,environment) {
  
  environment = environment || {}

  var output
    , envVars = Object.keys(environment)

  // run actual code in try catch
  try {
    
    // ghetto security, stub access
    var process = {}
    , window = {}
    , require = function(){ throw 'require not supported in NPC scripts' }

    var preamble = String()
    preamble += '\n\n//======= start of preamble ========\n\n'
    preamble += envVars.map(function(key){ return 'var '+key+' = environment.'+key+';' }).join('\n')
    preamble += '\n\n//======= end of preamble ========\n\n'

    var code = preamble + userCode
    // compile function
    func = eval('(function(environment) {\n'+code+'\n})')

    // call function with specified `this`
    output = func.call(self,environment)

  } catch (error) {
    console.error('-- secureEval error --')
    console.log(error.stack,code)
  }

  // return code output, if any
  return output
}