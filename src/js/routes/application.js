// # Our top-most route
App.ApplicationRoute = Em.Route.extend({

  activate: function() {
   console.log('application route')
  },

});

// Subroutes
require('./index.js')