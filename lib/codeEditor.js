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
    // listen for escape key to blur or exit code editor
    self.container.addEventListener('keydown', function(event) {
      // if escape key
      if (event.keyCode === 27 && self.isOpen) {
        // if the code editor has focus, denoted by css class CodeMirror-focused (see http://codemirror.net/doc/manual.html)
        if (self.container.childNodes[0].classList.contains('CodeMirror-focused')) {
          // blur by focusing on the window
          self.jsEditor.editor.getInputField().blur()
          event.stopPropagation()
        }
      }
    })
    window.addEventListener('keydown', function(event) {
      // if escape key pressed and editor is open, close the editor
      if (event.keyCode === 27 && self.isOpen) {
        self.close()
        event.stopPropagation()
      }
    })
    // squeltch keypress events bubbling from jseditor
    self.container.addEventListener('keypress', squeltchKeyEvents)
    self.container.addEventListener('keydown', squeltchKeyEvents)
    self.container.addEventListener('keyup', squeltchKeyEvents)
    // consume keypress events except for tilde
    function squeltchKeyEvents(event){ if (event.keyCode !== 192) event.stopPropagation() }
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