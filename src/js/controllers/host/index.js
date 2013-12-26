App.HostIndexController = Em.ArrayController.extend({

  // locally available worlds, set from the route
  content: null,

  actions: {

    // launch a server for this world
    launchWorld: function(world) {
      var self = this
      var applicationController = self.controllerFor('application')
      applicationController.startGameServer(world,function(hostId) {
        self.transitionToRoute('join.rtc',hostId)    
      })
    },

  },

})