App.HostIndexRoute = Em.Route.extend({
  
  needs: ['application'],

  setupController: function(controller) {
    var self = this
    var applicationController = self.controllerFor('application')
    applicationController.getWorlds(function(err,worlds) {
      if (err) throw err
      controller.set('content',worlds)
    })
  },

})