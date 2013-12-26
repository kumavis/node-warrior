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
      var serverConnection = localNetwork.WalkieTalkie()
      var clientConnection = localNetwork.WalkieTalkie()
      applicationController.connect(serverConnection,clientConnection)
    
    // Remote Hosted
    } else {

      var rtc = applicationController.connectToRtcHost(targetRtcHash)
    
    }
  },
  
})