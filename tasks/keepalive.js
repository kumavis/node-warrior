// dependencies
var fs = require('fs')

module.exports = function(grunt) {

  // keep grunt alive
  grunt.registerTask('keepalive', function() {
    var pidfile = './grunt.pid'
    fs.writeFileSync(pidfile,process.pid)
    grunt.log.write('Keeping Grunt task alive.\n')
    grunt.log.write('Grunt pid ('+process.pid+') recorded to \''+pidfile+'\'')
    this.async()
  })

}