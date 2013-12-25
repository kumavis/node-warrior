App.HostIndexController = Em.ArrayController.extend({

  // locally available worlds, set from the route
  content: null,

  actions: {

    // launch a server for this world
    launchWorld: function(world) {
      var self = this
      var applicationController = self.controllerFor('application')
      var server = applicationController.startGameServer(world)
      var rtcHash = applicationController.get('rtcConnectionHash')
      server.on('ready',function() {
        self.transitionToRoute('join.rtc',rtcHash)        
      })
    },

  },

})