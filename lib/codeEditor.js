// external dependencies
var createJsEditor = require('javascript-editor')

var self = module.exports = {

  jsEditor: null,
  
  container: document.getElementById('jseditor'),

  isOpen: false,

  initialize: function(game) {
    self.game = game
    // inject javascript editor
    self.jsEditor = createJsEditor({
      container: self.container,
      theme: 'monokai',
    })
    // squeltch keypress events bubbling from jseditor
    self.container.addEventListener('keypress', stopPropagation)
    self.container.addEventListener('keydown', stopPropagation)
    self.container.addEventListener('keyup', stopPropagation)
    function stopPropagation(event){ if (event.keyCode !== 192) event.stopPropagation() }
    // Hide editor - not hidden by default in order for CodeMirror to size correctly
    self.jsEditor.element.parentElement.classList.add('hidden')
    return self
  },

  // close the code editor
  close: function() {
    // if already closed, do nothing
    if (!self.isOpen) return
    // hide editor
    self.isOpen = false
    self.jsEditor.element.parentElement.classList.add('hidden')
    self.game.interact.request()
    // finalize previous code
    self.finalizeCode()
  },

  // show the code editor, given initial code and a callback 
  open: function(startCode, onComplete) {
    // if already open, finalize previous code
    if (self.isOpen) self.finalizeCode()
    // show editor
    self.isOpen = true
    self.jsEditor.editor.focus()
    self.jsEditor.element.parentElement.classList.remove('hidden')
    self.game.interact.release()
    // set code value
    self.jsEditor.setValue(startCode)
    // set `onComplete` callback
    self.onComplete = onComplete
  },

  // send code back to source via `onComplete` callback
  finalizeCode: function() {
    var finalCode = self.jsEditor.getValue()
    if (self.onComplete) self.onComplete(finalCode)
  }

}