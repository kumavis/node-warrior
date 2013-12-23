App.JoinLobbyRoute = Em.Route.extend({

  needs: ['application'],

  setupController: function() {
    var applicationController = this.controllerFor('application')
    applicationController.joinLobby()
  },

})
