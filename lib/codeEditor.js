// external dependencies
var createJsEditor = require('javascript-editor')
var codeBeam = require('./codeBeam.js')

var self = module.exports = {

  jsEditor: null,
  
  container: document.getElementById('jseditor'),

  isShowing: false,

  initialize: function(game) {
    self.game = game
    // inject javascript editor
    self.jsEditor = createJsEditor({
      container: self.container,
    })
    // Add key binding (tilde/backtick) to toggle editor
    window.addEventListener('keydown',function(event){
      if (event.keyCode === 192) self.toggleCodeEditor()
    })
    // squeltch keypress events bubbling from jseditor
    self.container.addEventListener('keypress', stopPropagation)
    self.container.addEventListener('keydown', stopPropagation)
    self.container.addEventListener('keyup', stopPropagation)
    function stopPropagation(event){ if (event.keyCode !== 192) event.stopPropagation() }
    // Hide editor - not hidden by default in order for CodeMirror to size correctly
    self.jsEditor.element.parentElement.classList.add('hidden')
  },

  toggleCodeEditor: function() {
    if (self.isShowing) {
      // hide editor
      self.isShowing = false
      self.jsEditor.element.parentElement.classList.add('hidden')
      self.game.interact.request()
    } else {
      // show editor
      self.isShowing = true
      self.jsEditor.editor.focus()
      self.jsEditor.element.parentElement.classList.remove('hidden')
      self.jsEditor.setValue(codeBeam.currentTool.code)
      self.game.interact.release()
    }
  },

}