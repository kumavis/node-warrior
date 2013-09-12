module.exports = function(grunt) {
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // App configurations
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

    // Build tasks
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

    // Delivery
    chauffeur: {
      dev: {
        port: 8002,
        staticFiles: [
          '<%= meta.build.base %>',
        ],
        lockfile: 'tmp/chauffeur.lock',
      }
    },

    // Utility
    copy: {
      html: {
        files: [{
          expand: true,
          cwd: '<%= meta.src.html %>/',
          src: ['**/*.*'],
          dest: '<%= meta.build.base %>/',
        }]
      },
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

    clean: {
      build: '<%= meta.tmp %>/*',
    },

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

  })

  // Build
  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-contrib-sass')
  // Delivery servers
  grunt.loadNpmTasks('grunt-chauffeur')
  // Utility
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-watch')

  // Usable tasks from command line
  grunt.registerTask('default', ['run'])
  grunt.registerTask('run', ['build', 'servers','watch'])

  grunt.registerTask('build', ['clean', 'copy:html', 'build:img', 'build:css', 'browserify'])
  grunt.registerTask('build:img', ['copy:blocks','copy:avatars'])
  grunt.registerTask('build:css', ['sass:build'])
  
  grunt.registerTask('servers', ['host','chauffeur:dev'])
  
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

