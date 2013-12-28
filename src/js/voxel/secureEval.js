// TODO "insert actual security here"
// TODO run non-block / in different thread / worker

/*

NODE.JS global objects:
======================

global
process
console
Class: Buffer
require()
require.resolve()
require.cache
require.extensions
__filename
__dirname
module
exports
setTimeout(cb, ms)
clearTimeout(t)
setInterval(cb, ms)
clearInterval(t)

CHROME global objects:
=====================
//== ==
//== Standard global objects (by category)
//== ==

//== General-purpose constructors
Array
Boolean
Date
Function
Number
Object
RegExp
String
//== Typed array constructors
ArrayBuffer
DataView
Float32Array
Float64Array
Int16Array
Int32Array
Int8Array
Uint16Array
Uint32Array
Uint8Array
Uint8ClampedArray
//== Internationalization constructors
Intl.Collator
Intl.DateTimeFormat
Intl.NumberFormat
//== Error constructors
Error
EvalError
RangeError
ReferenceError
SyntaxError
TypeError
URIError
//== Non-constructor functions
decodeURI
decodeURIComponent
encodeURI
encodeURIComponent
eval
isFinite
isNaN
parseFloat
parseInt
//== Other
Infinity
Intl
JSON
Math
NaN
undefined
null

*/

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
    console.log(error,error.stack,code)
  }

  // return code output, if any
  return output
}