module.exports = function(grunt) {
  
  grunt.initConfig({

    //
    // App configurations
    //

    pkg: grunt.file.readJSON('package.json'),

    meta: {
      title: 'Node Warrior',
      environment: 'dev',

      env: 'env/<%= meta.environment %>',
      tmp: 'tmp',

      lib: {
        base: 'lib',
        js: '<%= meta.lib.base %>/js',
        css: '<%= meta.lib.base %>/css',
      },
  
      src: {
        base: 'src',
        www: 'www',
        js: '<%= meta.src.base %>/js',
        css: '<%= meta.src.www %>/css',
        templates: '<%= meta.src.base %>/templates',
        img: {
          base: '<%= meta.src.www %>/img',
          icons: '<%= meta.src.img.base %>/icon',
          textures: {
            blocks: 'node_modules/painterly-textures/textures',
            avatars: '<%= meta.src.img.base %>/avatar',
          },
        },
      },

      build: {
        base: '<%= meta.tmp %>/build',
        img: '<%= meta.build.base %>/',
        html: '<%= meta.build.base %>',
        css: '<%= meta.build.base %>/css/',
        js: '<%= meta.build.base %>/js/',
        templates: '<%= meta.build.js %>/templates.js',
      }
    },

    // Run time environment modifications
    config: {
      prod: {
        options: {
          variables: {
            'meta.environment': 'prod',
            'browserify.options.debug': false,
          }
        }
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
        shim: {
          jquery: { path: './lib/js/jquery.js', exports: '$' },
          handlebars: { path: './lib/js/handlebars.js', exports: 'Handlebars' },
        },
      },
      dev_app: {
        files: {
          '<%= meta.build.js %>/app.js': ['./src/js/app.js'],
        },
      },
      prod_app: {
        debug: false,
        files: {
          '<%= meta.build.js %>/app.premin.js': ['./src/js/app.js'],
        },
      },
      dev_lib: {
        files: {
          '<%= meta.build.js %>/lib.js': ['./lib/js/lib.js'],
        },
      },
      prod_lib: {
        debug: false,
        files: {
          '<%= meta.build.js %>/lib.premin.js': ['./lib/js/lib.js'],
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
          ],
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
          styles:  ['css/app.css'],
          scripts: ['js/lib.js', 'js/templates.js', 'js/app.js'],
        },
        src: ['<%= meta.src.base %>/index.ejs'],
        dest: '<%= meta.build.html %>/index.html',
      },
    },

    // Ember templates
    emberTemplates: {
      compile: {
        options: {
          templateName: function(sourceFile) { return sourceFile.replace(/src\/templates\//, '') }
        },
        files: {
          '<%= meta.build.templates %>': '<%= meta.src.templates %>/**/*.hbs'
        }
      }
    },

    //
    // Utility
    //

    // clean build dir
    clean: {
      build: '<%= meta.tmp %>/*',
    },

    // move files to build dir
    copy: {
      libcss: {
        files: [{
          expand: true,
          cwd: '<%= meta.lib.css %>/',
          src: ['**.css'],
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
        tasks: ['lock', 'browserify:app', 'unlock'],
      },
      lib: {
        files: ['<%= meta.lib.js %>/**/*.js'],
        tasks: ['lock', 'browserify:lib', 'unlock'],
      },
      html: {
        files: ['<%= meta.src.base %>/index.ejs'],
        tasks: ['lock', 'ejs:index', 'unlock'],
        options: {
          livereload: true
        },
      },
      templates: {
        files: ['<%= meta.src.templates %>/**/*.hbs'],
        tasks: ['lock', 'emberTemplates', 'unlock']
      },
      styles: {
        files: ['<%= meta.src.css %>/**/*.scss','<%= meta.src.css %>/**/*.css'],
        tasks: ['lock', 'sass:build', 'unlock'],
        options: {
          livereload: true
        },
      },
    },

    // minify build files
    uglify: {
      prod: {
        files: {
          '<%= meta.build.js %>/app.js': '<%= meta.build.js %>/app.premin.js',
          '<%= meta.build.js %>/lib.js': '<%= meta.build.js %>/lib.premin.js',
        },
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

  })

  //
  // Load Tasks
  //

  // Runtime Modifications
  grunt.loadNpmTasks('grunt-config')

  // Build
  grunt.loadNpmTasks('grunt-ember-templates')
  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-sass')
  grunt.loadNpmTasks('grunt-ejs')

  // Asset Server
  grunt.loadNpmTasks('grunt-chauffeur')
  
  // Utility
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-uglify')

  // Lib Tasks
  grunt.loadTasks('./tasks')

  //
  // Define Tasks
  //

  // Default
  grunt.registerTask('default', ['dev'])

  // Build Modes
  grunt.registerTask('dev', ['build:dev', 'servers','watch'])
  grunt.registerTask('prod', ['build:prod', 'servers','keepalive'])

  // Build
  grunt.registerTask('build:dev', ['clean', 'build:html', 'build:templates', 'build:img', 'build:css', 'build:dev:js'])
  grunt.registerTask('build:prod', ['clean', 'build:html', 'build:templates', 'build:img', 'build:css', 'build:prod:js'])
  grunt.registerTask('build:html', ['ejs'])
  grunt.registerTask('build:templates', ['emberTemplates'])
  grunt.registerTask('build:img', ['copy:icons','copy:blocks','copy:avatars'])
  grunt.registerTask('build:css', ['copy:libcss','sass:build'])
  grunt.registerTask('build:dev:js', ['browserify:dev_lib','browserify:dev_app'])
  grunt.registerTask('build:prod:js', ['browserify:prod_lib','browserify:prod_app','uglify:prod'])
  
  // Servers
  grunt.registerTask('servers', ['chauffeur:dev'])
  
  // Utility
  grunt.registerTask('lock', ['chauffeur:dev:lock'])
  grunt.registerTask('unlock', ['chauffeur:dev:unlock'])

  // Launch dedicated voxel-server
  grunt.registerTask('host', ['launchServer','keepalive'])

}

