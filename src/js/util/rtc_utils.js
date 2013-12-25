var Peer = require('peerjs').Peer
var RtcDataStream = require('rtc-data-stream')
var DuplexEmitter = require('duplex-emitter')

// constants
const __ApiKey = '2pl4khtrswa8m2t9'

module.exports = {
  RtcConnection: RtcConnection,
  connectToHost: connectToHost,
}

function connectToHost(hostId,callback) {
  var rtc = RtcConnection()
  var dataConnection = rtc.connect(hostId, {reliable: true})
  dataConnection.on('open',function() {
    dataConnectionHasOpened(rtc,dataConnection)
  })
  return rtc
}

function RtcConnection(id) {
  var rtc = new Peer(id,{key: __ApiKey})
  rtc.on('open', function(id) { console.log('>> opened, got id:',id) })
  rtc.on('error', function(err) { console.log('>> had error:'); throw err })
  rtc.on('close', function() { console.log('>> closed') })
  rtc.on('connection', function(dataConnection) {
    console.log('>> got connection')
    // connection open
    dataConnection.on('open',function() {
      dataConnectionHasOpened(rtc,dataConnection)
    })
  })
  return rtc
}

function dataConnectionHasOpened(rtc,dataConnection){
  console.log('>-> connection opened')
  // data connection established, create a duplexEmitter
  var stream = RtcDataStream(dataConnection.dataChannel)
  var emitter = DuplexEmitter(stream)
  dataConnection.on('data',function(data) { console.log('>-> got data:',data) })
  dataConnection.on('error',function(err) { console.log('>-> connection had error:'); throw err })
  dataConnection.on('close',function() {
    console.log('>-> connection closed')
    rtc.emit('connectionLost',emitter)
  })
  rtc.emit('connectionEstablished',emitter)
}

function dataConnectionForHost(hostId) {
  var rtc = RtcConnection()
  var dataConnection = rtc.connect(hostId, {reliable: true})
  return dataConnection
}