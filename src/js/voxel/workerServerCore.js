// This is part of an attempt to run the server in a worker
// It is intended to be a drop in for the existing Server

// webworkify bundle
module.exports = function () {

  // monkey patch for modules not expecting to be in a worker
  self.window = self
  // monkey patch against posting a message with a target domain
  var _postMessage = self.postMessage.bind(self)
  self.window.postMessage = function(data){
    _postMessage(data)
  }

  /* NOTE 
  parentStream sending alien messages, eg:
    spy(parent in):
    └─ 0: process-tick
  */

  var ParentStream = require('workerstream/parent')
  var LevelUser = require('level-user')
  var VoxelLevel = require('voxel-level')
  var Uuid = require('hat')
  var Server = require('./server.js')
  var RtcUtil = require('../util/rtc_utils.js')
  var MuxDemux = require('mux-demux')
  var StreamSpy = require('../util/streamSpy.js')


  // create duplex stream for communicating with parent
  var parentStream = ParentStream()
  // setup stream namespacing
  var multiStream = MuxDemux()
  // listen for incomming connections
  multiStream.on('connection',function(stream){
    if (stream.meta === '_control') {
      setupControlStream(stream)
    } else {
      setupIncommingConnection(stream)
    }
  })
  // DEBUG - spy on stream
  console.log(' --- pipe streams together')
  parentStream
    // .pipe(StreamSpy('worker in'))
    .pipe(multiStream)
    // .pipe(StreamSpy('worker out'))
    .pipe(parentStream)
  
  // configure the controlStream for discussing connections
  function setupControlStream(controlStream){
    console.log(' --- setup control stream')
    // wait for initialization
    controlStream.once('data',function(opts){
      console.log(' --- game settings:')
      console.log(require('treeify').asTree(opts,true))

      // get voxel db
      var user = LevelUser({dbName: opts.dbName, baseURL: opts.dbDomain })
      opts.voxelDb = VoxelLevel(user.db)
      // create server

      var server = new Server(opts)
      server.on('ready',function(){
        // using this format to try to differentiate against alien events that are also being streamed accidently
        console.log(' --- server ready')
        controlStream.write({message:'ready'})
      })

      // No RTC capabilities in webworkers, so piping in via namespaces instead
      // // create rtc server
      // var host = RtcUtil.RtcConnection(hostId)
      // // when a client has connected
      // host.on('connectionEstablished',server.connectClient.bind(server))
      // // remove client on disconnect
      // host.on('connectionLost',server.removeClient.bind(server))
    })
  }

  // handle new connections
  function setupIncommingConnection(duplexStream){
    // tempStream is a temporary fix for server overwriting duplexEmitter.id
    var tempStream = require('duplex')()
      .on('_data', function (data) {
        tempStream.emit('data',data)
      })
      .on('_end', function () {
        tempStream.emit('end')
      })
    duplexStream
      // .pipe(StreamSpy('worker clientConn in'))
      .pipe(tempStream)
      // .pipe(StreamSpy('worker clientConn out'))
      .pipe(duplexStream)

    console.log(' --- connecting client stream')
    process.nextTick(function(){
      console.log(' --- adding client to server')
      // server.connectClient(duplexStream)
      server.connectClient(tempStream)
      duplexStream.on('end',function(){
        server.removeClient(duplexStream)
      })
    })
  }


}
