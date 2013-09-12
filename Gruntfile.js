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
        img: {
          base: '<%= meta.src.www %>/img',
          textures: {
            blocks: 'node_modules/painterly-textures/textures',
            avatars: 'node_modules/voxel-client/www',
          },
        },
        css: '<%= meta.src.www %>/css',
        html: '<%= meta.src.www %>',
      },

      build: {
        base: '<%= meta.tmp %>/build',
        img: '<%= meta.build.base %>/',
        html: '<%= meta.build.base %>',
        css: '<%= meta.build.base %>/css/app.css',
        js: '<%= meta.build.base %>/js/app.js',
      }
    },


    //
    // Build Tasks
    //

    // Javascript
    browserify: {
      options: {
        debug: true,
      },
      build: {
        files: {
          '<%= meta.build.js %>': ['index.js'],
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
          '<%= meta.build.css %>': '<%= meta.src.css %>/app.scss'
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
      blocks: {
        files: [{
          expand: true,
          cwd: '<%= meta.src.img.textures.blocks %>/',
          src: ['**/*.png'],
          dest: '<%= meta.build.img %>/textures',
        }]
      },
      avatars: {
        files: [{
          expand: true,
          cwd: '<%= meta.src.img.textures.avatars %>/',
          src: ['**/*.png'],
          dest: '<%= meta.build.img %>/',
        }]
      },
    },

    // trigger rebuild on file change
    watch: {
      app: {
        files: ['<%= meta.src.js %>/**/*.js'],
        tasks: ['lock', 'browserify', 'unlock']
      },
      html: {
        files: ['<%= meta.src.html %>/index.html'],
        tasks: ['lock', 'copy:index', 'unlock']
      },
      styles: {
        files: ['<%= meta.src.css %>/**/*.scss'],
        tasks: ['lock', 'sass:build', 'unlock'],
        options: {
          livereload: true
        }
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
  grunt.loadNpmTasks('grunt-contrib-sass')
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

  // Dev
  grunt.registerTask('dev', ['build', 'servers','watch'])

  // Build
  grunt.registerTask('build', ['clean', 'build:html', 'build:img', 'build:css', 'browserify'])
  grunt.registerTask('build:html', ['ejs'])
  grunt.registerTask('build:img', ['copy:blocks','copy:avatars'])
  grunt.registerTask('build:css', ['sass:build'])
  
  // Servers
  grunt.registerTask('servers', ['host','chauffeur:dev'])
  
  // Utility
  grunt.registerTask('lock', ['chauffeur:dev:lock'])
  grunt.registerTask('unlock', ['chauffeur:dev:unlock'])

  // Launch voxel-server
  grunt.registerTask('host', function() {
    grunt.log.write('Starting host server.')
    var server = require('voxel-server')(),
        serverPort = 8000
    server.listen(serverPort)
    grunt.log.write('Server Listening on ', serverPort)
  })



}

