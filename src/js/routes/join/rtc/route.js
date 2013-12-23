App.JoinRtcRoute = Em.Route.extend({

  needs: ['application'],

  model: function(args) {
    return args.server_id
  },

  setupController: function(controller, targetRtcHash) {
    var applicationController = this.needs('application')
    applicationController.joinGame(targetRtcHash)
  },
  
})