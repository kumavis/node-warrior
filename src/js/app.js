// Create App
window.App = Ember.Application.create({
  LOG_TRANSITIONS: true, // basic logging of successful transitions
  LOG_TRANSITIONS_INTERNAL: true, // detailed logging of all routing steps
  LOG_ACTIVE_GENERATION: true, // log generated objects
})

// App Parts
require('./routes/_index.js')
require('./controllers/_index.js')
require('./views/_index.js')