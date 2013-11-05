App.Router.map(function() {

  // Main menu
  this.resource('menu', function() {
    this.route('settings')
  })

  // Create a new world
  this.resource('create', function() {
  
  })

  // Join a remote game
  this.resource('join', function() {
    // join the dedicated lobby server
    this.route('lobby')
    // join an RTC game
    this.resource('join.rtc', { path: 'rtc/:server_id' })
  })

  // Host an RTC game
  this.resource('host', function() {
  
  })

})