// based on rtc-quickconnect https://github.com/rtc-io/rtc-quickconnect/

var EventEmitter = require('events').EventEmitter;
var rtc = require('rtc');
var defaults = require('cog/defaults');
var reTrailingSlash = /\/$/;

module.exports = function(opts) {
  opts = opts || {}
  var hash = opts.hash
  var emitter = new EventEmitter()
  var signaller
  var logger
  var peers = {}
  var monitor

  function channel(peerId, dc) {
    dc.addEventListener('open', function(evt) {
      emitter.emit('dc:open', dc, peerId)
    })
  }

  // if the opts is a string, then we only have a namespace
  if (typeof opts == 'string' || (opts instanceof String)) {
    opts = {
      ns: opts
    }
  }

  // initialise the deafult opts
  opts = defaults(opts, {
    signaller: 'http://localhost:3000'
  })

  // create our logger
  logger = rtc.logger(opts.ns)

  // if debug is enabled, then let's get some noisy logging going
  if (opts.debug) {
    rtc.logger.enable('*')
  }

  // if the hash is not assigned, then create a random hash value
  if (!hash) hash = '' + (Math.pow(2, 53) * Math.random())

  // load socket.io script
  loadPrimus(opts.signaller, function() {
    // create our signaller
    signaller = rtc.signaller(Primus.connect(opts.signaller))

    // provide the signaller via an event so it can be used externally
    emitter.emit('signaller', signaller)

    signaller.on('announce', function(data) {
      var peer
      var dc

      // if this is a known peer then abort
      if ((! data) || peers[data.id]) {
        return
      }

      // if the room is not a match, abort
      if (data.room !== (opts.ns + '#' + hash)) {
        return
      }

      // create a peer
      peer = peers[data.id] = rtc.createConnection(opts)

      // if we are working with data channels, create a data channel too
      if (opts.data && (! data.answer)) {
        channel(data.id, peer.createDataChannel('tx', { reliable: false }))
      }
      else if (opts.data) {
        peer.addEventListener('datachannel', function(evt) {
          channel(data.id, evt.channel)
        })
      }

      // couple the connections
      monitor = rtc.couple(peer, { id: data.id }, signaller, opts)

      // trigger the peer event
      emitter.emit('peer', peer, data.id, data, monitor)

      // if not an answer, then announce back to the caller
      if (! data.answer) {
        signaller.to(data.id).announce({
          room: (opts.ns || '') + '#' + hash,
          answer: true
        })
      }
    })

    // pass on leave events
    signaller.on('leave', emitter.emit.bind(emitter, 'leave'))

    // time to announce ourselves
    signaller.announce({ room: (opts.ns || '') + '#' + hash })
  })

  // expose hash value on emitter
  emitter.hash = hash

  return emitter
}

function loadPrimus(url, callback) {
  var script = document.createElement('script')
  script.src = url.replace(reTrailingSlash, '') + '/rtc.io/primus.js'
  script.addEventListener('load', callback)
  document.body.appendChild(script)
}