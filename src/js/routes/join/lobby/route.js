App.JoinLobbyRoute = Em.Route.extend({

  needs: ['application'],

  setupController: function() {
    var self = this
    var applicationController = self.controllerFor('application')
    applicationController.joinLobby()
  },

})
