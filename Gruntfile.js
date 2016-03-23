//
// Assume that grunt-cli has been installed at the npm -g level, so can run grunt
//

module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: [
        '*/lib/*.js', '*/test/*.js'],
      options: {
        predef: ['describe', 'it', 'before'],
        exported: ['should'],
        curly: true,
        indent: 2,
        node: true,
        undef: true,
        unused: true,
        eqeqeq: true,
        strict: true,
        esversion: 6
      }
    },

    mochaTest: {
      unitTest: {
        options: {
          reporter: 'spec'
        },
        src: ['*/test/*.js']
      }
    },

    jscs: {
      check: {
        src: ['*/lib/*.js', '*/test/*.js'],
        options: {
          preset: 'airbnb',
          disallowMultipleVarDecl: false,
          requireTrailingComma: false,
          maximumLineLength: 255,
          requireSpacesInAnonymousFunctionExpression: {
            beforeOpeningRoundBrace: true
          },
        },
      },
      fix: {
        src: ['*/lib/*.js', '*/test/*.js'],
        options:{
          preset: 'airbnb',
          disallowMultipleVarDecl: false,
          requireTrailingComma: false,
          fix: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-buddyjs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-jscs');

  grunt.registerTask('pp', 'preprocess files', ['jshint', 'jscs:check']);

  grunt.registerTask('test', ['pp', 'mochaTest:unitTest']);

  grunt.registerTask('default', ['test']);

};
