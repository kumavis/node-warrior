var rtcDataStream = require('rtc-data-stream')
// var quickconnect = require('rtc-quickconnect')
const { default: Peer } = require('peerjs')
const EventEmitter = require('events')


module.exports = {
  RtcConnection: RtcConnection,
  connectToHost: connectToHost,
}

function connectToHost(hostId,callback) {
  var rtc = RtcConnection()
  var dataConnection = rtc.connect(hostId, {reliable: true})
  dataConnection.on('open',function() {
    console.log('connected to host', hostId)
    dataConnectionHasOpened(rtc,dataConnection)
  })
  return rtc
}

function RtcConnection(hostid) {
  // var rtc = new Peer(id,{key: __ApiKey})
  var rtc = new Peer(hostid)
  // rtc.on('open', function(id) { console.log('>> opened, got id:', id, hostid) })
  // rtc.on('error', function(err) { console.log('>> had error:'); throw err })
  // rtc.on('close', function() { console.log('>> closed') })
  rtc.on('connection', function(dataConnection) {
    console.log('>> got connection')
    // connection open
    dataConnection.on('open',function() {
      dataConnectionHasOpened(rtc,dataConnection)
    })
  })
  return rtc
}

// function connectToHost(hostId,callback) {
//   var rtc = RtcConnection(hostId)
//   // var dataConnection = rtc.connect(hostId, {reliable: true})
//   // rtc.on('connectionEstablished',function(dataConnection) {
//   //   dataConnectionHasOpened(rtc, dataConnection)
//   // })
//   return rtc
// }

// function RtcConnection(id) {
//   const rtc = new EventEmitter()

//   const peer = new Peer(`node-warrior-${id}`) 
//   // quickconnect('https://switchboard.rtc.io/', { room: `node-warrior-${id}` })
//   .createDataChannel('primary')
//   .on('channel:opened:primary', function(peerId, channel) {
    
//     console.log('>> got connection')
//     const duplexStream = rtcDataStream(channel)
//     // rtc.emit('connectionLost',duplexStream)
//     rtc.emit('connectionEstablished',duplexStream)

//       // console.log('>> got connection')
//       // // connection open
//       // dataConnection.on('open',function() {
//       //   dataConnectionHasOpened(rtc,dataConnection)
//       // })

//   })
//   return rtc

  // var rtc = new Peer(id,{key: __ApiKey})
  // rtc.on('open', function(id) { console.log('>> opened, got id:',id) })
  // rtc.on('error', function(err) { console.log('>> had error:'); throw err })
  // rtc.on('close', function() { console.log('>> closed') })
  // rtc.on('connection', function(dataConnection) {
  //   console.log('>> got connection')
  //   // connection open
  //   dataConnection.on('open',function() {
  //     dataConnectionHasOpened(rtc,dataConnection)
  //   })
  // })
  // return rtc
// }

function dataConnectionHasOpened(rtc,dataConnection){
  console.log('>-> connection opened')
  // data connection established, create a duplex stream
  var duplexStream = RtcDataStream(dataConnection.dataChannel)
  // dataConnection.on('data',function(data) { console.log('>-> got data:',data) })
  dataConnection.on('error',function(err) { console.log('>-> connection had error:'); throw err })
  dataConnection.on('close',function() {
    console.log('>-> connection closed')
    rtc.emit('connectionLost',duplexStream)
  })
  rtc.emit('connectionEstablished',duplexStream)
}

function dataConnectionForHost(hostId) {
  var rtc = RtcConnection()
  var dataConnection = rtc.connect(hostId, {reliable: true})
  return dataConnection
}