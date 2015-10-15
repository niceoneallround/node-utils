//
// Assume that grunt-cli has been installed at the npm -g level, so can run grunt
//

module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: [
        'lib/**/*.js',
        'test/**/*.js'],
      options: {
        predef: ['describe', 'it'],
        exported: ['should'],
        curly: true,
        indent: 2,
        node: true,
        undef: true,
        unused: true,
        eqeqeq: true,
        strict: true
      }
    },

    mochaTest: {
      unitTest: {
        options: {
          reporter: 'spec'
        },
        src: ['test/unit/*/*.js']
      }
    },

    jscs: {
      src: ['lib', 'lib/*/*.js', '*.js', 'test/*/*.js'],
      options: {
        preset: 'airbnb'
      }
    }
  });

  grunt.loadNpmTasks('grunt-buddyjs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-jscs');

  grunt.registerTask('log', 'log name', function(arg) {
    grunt.log.writeln('In Logger');
  });

  grunt.registerTask('pp', 'preprocess files', ['log', 'jshint', 'jscs']);

  grunt.registerTask('utest', ['log', 'pp', 'mochaTest:unitTest']);
  grunt.registerTask('test', ['utest']);

  grunt.registerTask('default', ['pp', 'mochaTest:unitTest']);

};
