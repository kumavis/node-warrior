App.HostIndexRoute = Em.Route.extend({
  
  needs: ['application'],

  setupController: function(controller) {
    var applicationController = this.controllerFor('application')
    return applicationController.getWorlds(function(err,worlds) {
      if (err) throw err
      controller.set('content',worlds)
    })
  },

})