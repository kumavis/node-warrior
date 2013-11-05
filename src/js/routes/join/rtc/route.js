var rtcDataStream = require('rtc-data-stream')
var duplexEmitter = require('duplex-emitter')
var WalkieTalkieChannel = require('walkietalkie')
var Rtc = require('../../../voxel/rtc.js')

App.JoinRtcRoute = Em.Route.extend({

  needs: ['application'],

  model: function(args) {
    return args.server_id
  },

  serialize: function() {
    debugger
  },

  setupController: function(controller, serverId) {
    var applicationController = this.controllerFor('application')
    var existingHash = applicationController.get('rtcServer.hash')
    // Self Hosted
    if (serverId === existingHash) {
      var localNetwork = WalkieTalkieChannel()
      applicationController.connect(localNetwork.WalkieTalkie())
    // Remote Hosted
    } else {
      var rtc = Rtc({
        hash: serverId,
        signaller: 'http://sig.rtc.io:50000',
        ns: 'dctest',
        data: true,
        debug: true,
      })
      rtc.on('dc:open', function(channel, peerId) {
        var dataStream = rtcDataStream(channel)
        var connection = duplexEmitter(dataStream)
        applicationController.connect(connection)
      })
    }
  },
  
})