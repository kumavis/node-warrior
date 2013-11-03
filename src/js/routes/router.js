App.Router.map(function() {

  // Main menu
  this.resource('menu', function() {
    this.route('settings')
  })

  // Join an RTC game
  this.resource('join', function() {
    this.route('lobby')
  })

  // // Host an RTC game
  // this.resource('host', { path: '/host' }, function() {
  //   this.route('ready', { path: '/host/:rtc_target' })
  // })

})