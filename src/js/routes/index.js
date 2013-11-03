// Our Application Index route
App.IndexRoute = Em.Route.extend({
  
  activate: function() {
    console.log('index route')
  },

  redirect: function() {
    this.transitionTo('menu')
  },

})