
// Start the client and point it at the game server on same domain, port 8000
require('./lib/client.js')({
  server: 'ws://'+document.domain+':8000/',
})
