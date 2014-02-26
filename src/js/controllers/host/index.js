App.HostIndexController = Em.ArrayController.extend({

  needs: ['application'],

  // locally available worlds, set from the route
  content: null,

  actions: {

    // launch a server for this world
    launchWorld: function(world) {
      var self = this
      var applicationController = self.get('controllers.application')
      applicationController.startGameServer(world,function(hostId) {
        self.transitionToRoute('join.rtc',hostId)    
      })
    },

  },

})