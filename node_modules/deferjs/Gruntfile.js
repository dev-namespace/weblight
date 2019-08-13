/*jslint node: true, indent: 2, passfail: true */
"use strict";

module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jslint: {
      all: {
        src: ['defer/*'],
        exclude: ['test/*', 'Gruntfile.js'],
        directives: {
          node: true,
          browser: true,
          indent: 2,
          passfail: true
        },
        options: {
          edition: 'latest'
        }
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/*.js']
      }
    },
    browserify: {
      dist: {
        files: {
          'build/defer.browser.js': ['defer/*']
        },
        options: {
          bundleOptions: {
            "standalone": "deferjs"
          }
        },
      },
      tests: {
        files: {
          'build/defer.tests.browser.js': ['test/*.spec.js']
        },
        options: {}
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: {
          'build/defer.browser.min.js': ['build/defer.browser.js'],
          'build/defer.tests.browser.min.js': ['build/defer.tests.browser.js']
        },
      }
    },
    shell: {
      prepareBrowserTests: {
        command: 'test/install_libs'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['jslint', 'mochaTest', 'browserify', 'uglify', 'shell']);

};
