App.HostIndexRoute = Em.Route.extend({
  
  needs: ['application'],

  setupController: function(controller) {
    var self = this
    var applicationController = self.controllerFor('application')
    applicationController.getWorlds(function(err,worlds) {
      if (err) throw err
      // shortcut for debugging
      controller.send('launchWorld',worlds[0])
      controller.set('content',worlds)
    })
  },

})