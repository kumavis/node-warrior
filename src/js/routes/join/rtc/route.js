App.JoinRtcRoute = Em.Route.extend({

  needs: ['application'],

  model: function(args) {
    return args.server_id
  },

  setupController: function(controller, targetRtcHash) {
    var self = this
    var applicationController = self.controllerFor('application')
    applicationController.joinGame(targetRtcHash)
  },
  
})