// This is part of an attempt to run the server in a worker
// It is intended to be a drop in for the existing Server

var Webworkify = require('webworkify')
var WorkerStream = require('workerstream')
var EventEmitter = require('events').EventEmitter
var extend = require('extend')
var MuxDemux = require('mux-demux')
var Uuid = require('hat')
var StreamSpy = require('../util/streamSpy.js')

module.exports = WorkerServer


function WorkerServer(opts){
  // force instantiation via `new` keyword 
  if(!(this instanceof WorkerServer)) { return new WorkerServer(opts) }
  this.initialize(opts)
}

WorkerServer.prototype.initialize = function(opts){
  // expose emitter methods to module consumer
  extend(this,new EventEmitter())
  // modify options hash
  opts.dbDomain = document.domain
  opts.dbName = opts.voxelDb.db.location
  delete opts.voxelDb
  // create worker and establish stream
  var worker = Webworkify(require('./workerServerCore.js'))
  var workerStream = this.workerStream = WorkerStream(worker)
  // setup stream namespacing
  var multiStream = this.multiStream = MuxDemux()

  // pipe the streams
  console.log(' +++ pipe streams together')
  workerStream
    // .pipe(StreamSpy('parent in'))
    .pipe(multiStream)
    // .pipe(StreamSpy('parent out'))
    .pipe(workerStream)
  
  // create a controlStream for discussing connections
  var controlStream = this.controlStream = this.multiStream.createStream('_control')
  // create server in worker
  console.log(' +++ listen for controlStream')
  controlStream.once('data',this._checkServerInitialization.bind(this))
  controlStream.on('error',function(err){
    // already logged to console by chrome(?)
    // console.error(err)
  })
  console.log(' +++ pass opts')
  controlStream.write(opts)
  // create a collection of client streams
  this.clientStreams = {}
}

WorkerServer.prototype.connectClient = function(duplexStream){
  // create a namespaced stream for piping this connection to the webworker
  var id = Uuid()
  duplexStream.id = id
  var clientStream = this.multiStream.createStream(id)
  this.clientStreams[id] = clientStream
  // connect namespaced stream
  console.log(' +++ connecting client stream')
  clientStream.resume()
  clientStream.on('end',function(){ debugger })
  // duplexStream.pipe(clientStream).pipe(duplexStream)
  duplexStream
    // .pipe(StreamSpy('clientConn in'))
    .pipe(clientStream)
    // .pipe(StreamSpy('clientConn out'))
    .pipe(duplexStream)
  // clientStream
  //   .pipe(StreamSpy('clientConn in'))
  //   .pipe(duplexStream)
  //   .pipe(StreamSpy('clientConn out'))
  //   .pipe(clientStream)
}

WorkerServer.prototype.removeClient = function(duplexStream){
  var id = duplexStream.id
  var clientStream = this.clientStreams[id]
  clientStream.end()
}

//
// Private
//

WorkerServer.prototype._checkServerInitialization = function(data){
  // this is initialization message, tell the cosumer we're ready
  if (data && typeof data === 'object' && data.message === 'ready') {
    console.log(' +++ remote server ready')
    this.emit('ready')
  // this is the wrong message, check again
  } else {
    this.controlStream.once('data',this._checkServerInitialization.bind(this))
  }
}