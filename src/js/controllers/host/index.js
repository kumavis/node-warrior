App.HostIndexController = Em.ArrayController.extend({

  // locally available worlds, set from the route
  content: null,

  actions: {

    // launch a server for this world
    launchWorld: function(world) {
      var applicationController = this.controllerFor('application')
      var serverId = applicationController.startServer(world)
      this.transitionToRoute('join.rtc',serverId)
    },

  },

})