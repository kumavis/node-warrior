var rtcDataStream = require('rtc-data-stream')
var duplexEmitter = require('duplex-emitter')
var WalkieTalkieChannel = require('walkietalkie')

App.JoinRtcRoute = Em.Route.extend({

  needs: ['application'],

  model: function(args) {
    return args.server_id
  },

  setupController: function(controller, targetRtcHash) {
    var applicationController = this.controllerFor('application')
    var existingRtcHash = applicationController.get('rtcConnectionHash')
    // Self Hosted
    if (targetRtcHash === existingRtcHash) {
      var localNetwork = WalkieTalkieChannel()
      var server = localNetwork.WalkieTalkie()
      var client = localNetwork.WalkieTalkie()
      
      // ! Debug !
      console.log('-- connection logging enabled, "update" squeltched --')
      function logger(isClient){
        return function(args){
          var args = [].slice.apply(args)
          var eventName = args.shift()
          var direction = isClient ? '-->' : '<--'
          if (eventName !== 'update' && eventName !== 'state') {
            console.log(direction,eventName,args)
          }
        }
      }
      server.on('*',logger(false))
      client.on('*',logger(true))
      // ! Debug !

      applicationController.connect(server,client)
    // Remote Hosted
    } else {
      var rtc = applicationController.connectRtc(targetRtcHash)
      rtc.on('dc:open', function(channel, peerId) {
        debugger
        var dataStream = rtcDataStream(channel)
        var connection = duplexEmitter(dataStream)
        applicationController.connect(connection)
      })
    }
  },
  
})