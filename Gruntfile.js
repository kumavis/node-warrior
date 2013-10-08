module.exports = function(grunt) {
  
  grunt.initConfig({

    //
    // App configurations
    //

    pkg: grunt.file.readJSON('package.json'),

    meta: {
      title: 'Node Warrior',
      
      tmp: 'tmp',
  
      src: {
        base: 'lib',
        www: 'www',
        js: '<%= meta.src.base %>',
        vendor: '<%= meta.src.base %>/vendor',
        img: {
          base: '<%= meta.src.www %>/img',
          icons: '<%= meta.src.img.base %>/icon',
          textures: {
            blocks: 'node_modules/painterly-textures/textures',
            avatars: '<%= meta.src.img.base %>/avatar',
          },
        },
        css: '<%= meta.src.www %>/css',
        html: '<%= meta.src.www %>',
      },

      build: {
        base: '<%= meta.tmp %>/build',
        img: '<%= meta.build.base %>/',
        html: '<%= meta.build.base %>',
        css: '<%= meta.build.base %>/css/',
        js: '<%= meta.build.base %>/js/',
      }
    },


    //
    // Build Tasks
    //

    // Javascript
    browserify: {
      options: {
        debug: true,
        transform: ['brfs'],
      },
      build: {
        files: {
          '<%= meta.build.js %>/app.js': ['./lib/app.js'],
        },
      },
    },

    // Css
    sass: {
      build: {
        options: {
          style: 'expanded',
          quiet: true,
          cacheLocation: '<%= meta.tmp %>/cache',
          loadPath: [
            '<%= meta.src.css %>',
          ]
        },
        files: {
          '<%= meta.build.css %>/app.css': '<%= meta.src.css %>/app.scss'
        }
      }
    },

    // Html
    ejs: {
      index: {
        options: {
          title: '<%= meta.title %>',
          appBody: '<%= meta.src.html %>/main',
        },
        src: ['<%= meta.src.html %>/index.ejs'],
        dest: '<%= meta.build.html %>/index.html',
      },
    },


    //
    // Servers
    //

    // launch the client server
    chauffeur: {
      dev: {
        port: 8002,
        staticFiles: [
          '<%= meta.build.base %>',
        ],
        lockfile: 'tmp/chauffeur.lock',
      }
    },

    //
    // Utility
    //

    // move files to build dir
    copy: {
      pacejs: {
        files: [{
          expand: true,
          cwd: '<%= meta.src.vendor %>/',
          src: ['pace.js'],
          dest: '<%= meta.build.js %>/',
        }]
      },
      pacecss: {
        files: [{
          expand: true,
          cwd: '<%= meta.src.css %>/',
          src: ['pace.css'],
          dest: '<%= meta.build.css %>/',
        }]
      },
      blocks: {
        files: [{
          expand: true,
          cwd: '<%= meta.src.img.textures.blocks %>/',
          src: ['*.png'],
          dest: '<%= meta.build.img %>/textures',
        }]
      },
      avatars: {
        files: [{
          expand: true,
          cwd: '<%= meta.src.img.textures.avatars %>/',
          src: ['*.png'],
          dest: '<%= meta.build.img %>/',
        }]
      },
      icons: {
        files: [{
          expand: true,
          cwd: '<%= meta.src.img.icons %>/',
          src: ['*.gif'],
          dest: '<%= meta.build.img %>/img',
        }]
      },
    },

    // trigger rebuild on file change
    watch: {
      app: {
        files: ['<%= meta.src.js %>/**/*.js'],
        tasks: ['lock', 'browserify', 'unlock'],
      },
      html: {
        files: ['<%= meta.src.html %>/**/*.ejs'],
        tasks: ['lock', 'ejs:index', 'unlock'],
        options: {
          livereload: true
        },
      },
      styles: {
        files: ['<%= meta.src.css %>/**/*.scss','<%= meta.src.css %>/**/*.css'],
        tasks: ['lock', 'sass:build', 'unlock'],
        options: {
          livereload: true
        },
      },
    },

    // clean build dir
    clean: {
      build: '<%= meta.tmp %>/*',
    },

  })

  //
  // Load Tasks
  //

  // Build
  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-sass')
  grunt.loadNpmTasks('grunt-ejs')

  // Servers
  grunt.loadNpmTasks('grunt-chauffeur')
  
  // Utility
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-watch')

  //
  // Define Tasks
  //

  // Default
  grunt.registerTask('default', ['dev'])

  // Build Modes
  grunt.registerTask('dev', ['build', 'servers','watch'])
  grunt.registerTask('prod', ['build', 'servers','keepalive'])

  // Build
  grunt.registerTask('build', ['clean', 'build:html', 'build:img', 'build:css', 'build:js'])
  grunt.registerTask('build:html', ['ejs'])
  grunt.registerTask('build:img', ['copy:icons','copy:blocks','copy:avatars'])
  grunt.registerTask('build:css', ['copy:pacecss','sass:build'])
  grunt.registerTask('build:js', ['copy:pacejs','browserify'])
  
  // Servers
  grunt.registerTask('servers', ['host','chauffeur:dev'])
  
  // Utility
  grunt.registerTask('lock', ['chauffeur:dev:lock'])
  grunt.registerTask('unlock', ['chauffeur:dev:unlock'])

  // Launch voxel-server
  grunt.registerTask('host', function() {
    var port = 8000

    // dependencies
    var http = require('http')
    var path = require('path')
    var ecstatic = require('ecstatic')
    var WebSocketServer = require('ws').Server
    var websocket = require('websocket-stream')
    var duplexEmitter = require('duplex-emitter')
    var Server = require('./lib/server.js')

    // create server
    var server = new Server({
      worldId: 'kumavis',
    })
    // setup WebSocketServer
    grunt.log.write('Starting host server.')
    var httpServer = http.createServer(ecstatic(path.join(__dirname, 'www')))
    var wss = new WebSocketServer({server: httpServer})
    httpServer.listen(port)
    wss.on('connection',function(ws) {
      var stream = websocket(ws)
      var connection = duplexEmitter(stream)
      server.connectClient(connection)
      // handle connection end/error
      stream.once('end', function(){ server.removeClient(connection) })
      stream.once('error', function(){ server.removeClient(connection) })
    })
    grunt.log.write('Server Listening on ', port)
  })

  // Keep alive
  grunt.registerTask('keepalive', function() {
    var fs = require('fs')

    var pidfile = './grunt.pid'
    fs.writeFileSync(pidfile,process.pid)
    grunt.log.write('Keeping Grunt task alive.\n')
    grunt.log.write('Grunt pid ('+process.pid+') recorded to \''+pidfile+'\'')
    this.async()
  })

}

