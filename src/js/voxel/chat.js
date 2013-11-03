module.exports = function(opts) {
  var inputBox = opts.element.querySelector('#cmd')
  var messages = opts.element.querySelector('#messages')

  // bind to chat event
  opts.emitter.on('chat',emitChat)

  // Handle entering a command
  opts.element.addEventListener('keyup', function(event) {
    // on enterkey press
    if (event.keyCode !== 13) return
    // get and sanitize message
    var message = inputBox.value
    if (!message) return
    message = message.slice(0, 140)
    // build and emit chat message
    var chat = {user: opts.user, text: message}
    opts.emitter.emit('chat',chat)
    // reset text box
    inputBox.value = ''
    inputBox.blur()
  })

  // enter key brings us into chat
  window.addEventListener('keyup', function(event) {
    // on enterkey press
    if (event.keyCode !== 13) return
    // give focus to chat box
    inputBox.focus()
  })

  // squeltch keypress events bubbling from chat box
  opts.element.addEventListener('keypress', stopPropagation)
  opts.element.addEventListener('keydown', stopPropagation)
  opts.element.addEventListener('keyup', stopPropagation)
  function stopPropagation(event){ event.stopPropagation() }

  // return an API for consumption
  return {
    showMessage: showMessage,
    emitChat: emitChat,
  }

  function emitChat(chat) {
    var message = chat.user + ': ' + chat.text
    showMessage(message)
  }

  function showMessage(message) {
    var li = document.createElement('li')
    li.innerHTML = message
    messages.appendChild(li)
    messages.scrollTop = messages.scrollHeight
  }
}
