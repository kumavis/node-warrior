// external dependencies
var createJsEditor = require('javascript-editor')

// module globals
var jsEditor

var self = module.exports = {

  isShowing: false,

  initialize: function(game) {
    self.game = game
    // inject javascript editor
    jsEditor = createJsEditor({
      container: document.getElementById('jseditor'),
    })
    // Add key event to toggle editor
    window.addEventListener('keydown',function(event){
      if (event.keyCode === 192) self.toggleCodeEditor()
    })
    // Hide editor - not hidden by default in order for CodeMirror to size correctly
    jsEditor.element.parentElement.classList.add('hidden')
  },

  toggleCodeEditor: function() {
    if (self.isShowing) {
      // hide editor
      self.isShowing = false
      jsEditor.element.parentElement.classList.add('hidden')
      self.game.interact.request()
    } else {
      // show editor
      self.isShowing = true
      jsEditor.editor.focus()
      jsEditor.element.parentElement.classList.remove('hidden')
      self.game.interact.release()
    }
  },

}