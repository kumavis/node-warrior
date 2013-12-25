var Peer = require('peerjs').Peer
var RtcDataStream = require('rtc-data-stream')
var DuplexEmitter = require('duplex-emitter')

// constants
const __ApiKey = '2pl4khtrswa8m2t9'

module.exports = {
  connectToHost: connectToHost,
  onPeerConnection: onPeerConnection,
}

function connectToHost(hostId,callback) {
  var dataConnection = dataConnectionForHost(hostId)
  createEmitterOverConnection(dataConnection,callback)
}

function onPeerConnection(hostId,callback) {
  var host = setupRtcConnection(hostId)
  host.on('connection',function(dataConnection) {
    createEmitterOverConnection(dataConnection,callback)
  })
  return host
}

function createEmitterOverConnection(dataConnection,callback) {
  dataConnection.on('open',function() {
    // data connection established, create a duplexEmitter
    var stream = RtcDataStream(dataConnection.dataChannel)
    var emitter = DuplexEmitter(stream)
    // return duplexEmitter to consumer
    callback(false,emitter)
  })
}

function setupRtcConnection(id) {
  var peer = new Peer(id,{key: __ApiKey})
  peer.on('error', function(err) { console.error(err) })
  peer.on('open', function(id) { console.log('>> got id:',id) })
  peer.on('message', function(data) { console.log('>> got message:',message) })
  peer.on('connection', function(dataConnection) {
    console.log('>> got connection')
    dataConnection.on('open',function() { console.log('>> connection opened') })
    dataConnection.on('data',function(data) { console.log('>> got data:',data) })
  })
  return peer
}

function dataConnectionForHost(hostId) {
  var rtc = setupRtcConnection()
  var dataConnection = rtc.connect(hostId, {reliable: true})
  return dataConnection
}