var rtcDataStream = require('rtc-data-stream')
var duplexEmitter = require('duplex-emitter')
var WalkieTalkieChannel = require('walkietalkie')

App.JoinRtcRoute = Em.Route.extend({

  needs: ['application'],

  model: function(args) {
    return args.server_id
  },

  serialize: function() {
    debugger
  },

  setupController: function(controller, targetRtcHash) {
    var applicationController = this.controllerFor('application')
    var existingRtcHash = applicationController.get('rtcConnection.hash')
    // Self Hosted
    if (targetRtcHash === existingRtcHash) {
      var localNetwork = WalkieTalkieChannel()
      var connectionClient = localNetwork.WalkieTalkie()
      var connectionServer = localNetwork.WalkieTalkie()
      
      // ! Debug !
      connectionClient.on('id',function(){console.log('connection got id',arguments)})
      connectionClient.on('settings' ,function(){console.log('connection got settings',arguments)})
      connectionClient.on('chunk' ,function(){console.log('connection got chunk',arguments)})
      connectionClient.on('noMoreChunks' ,function(){console.log('connection got noMoreChunks',arguments)})
      connectionServer.on('created',function(){console.log('connection got created',arguments)})
      // ! Debug !

      applicationController.connect(connectionClient,connectionServer)
    // Remote Hosted
    } else {
      var rtc = applicationController.connectRtc(targetRtcHash)
      rtc.on('dc:open', function(channel, peerId) {
        var dataStream = rtcDataStream(channel)
        var connection = duplexEmitter(dataStream)
        applicationController.connect(connection)
      })
    }
  },
  
})