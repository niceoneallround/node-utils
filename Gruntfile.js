//
// Assume that grunt-cli has been installed at the npm -g level, so can run grunt
//
// Builds and tests all utils
//

module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    shell: {
      //
      // npm update, build and run regression tests for all code
      //
      buildTestCode: {
        command: [
          'echo run utils:buildTestCode',
          'cd logger', 'npm update', 'grunt', 'cd ..'
                  ].join('&&'),
        options: {
          execOptions: {
            maxBuffer: Infinity
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-shell');
  grunt.registerTask('buildTestCode', ['shell:buildTestCode']);
  grunt.registerTask('default', ['buildTestCode']);
};
