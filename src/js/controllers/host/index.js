App.HostIndexController = Em.ArrayController.extend({

  // locally available worlds, set from the route
  content: null,

  actions: {

    // launch a server for this world
    launchWorld: function(world) {
      var applicationController = this.controllerFor('application')
      applicationController.startGameServer(world)
      var rtcHash = applicationController.get('rtcConnection.hash')
      this.transitionToRoute('join.rtc',rtcHash)
    },

  },

})