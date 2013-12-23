App.JoinRoute = Em.Route.extend({

  activate: function() {
    this.controllerFor('application').set('showGame',true)
  },

  deactivate: function() {
    this.controllerFor('application').set('showGame',false)
  },

})

// Subroutes
require('./index.js')
require('./lobby/route.js')
require('./rtc/route.js')