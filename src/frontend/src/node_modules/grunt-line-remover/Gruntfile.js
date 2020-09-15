module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      test: [ 'tmp' ]
    },
    lineremover: {
      noOptions: {
        files: {
          'tmp/sampleWithoutWhitespace.html': 'test/fixtures/sampleWithWhitespace.html'
        }
      },
      customExclude: {
        files: {
          'tmp/sampleExclusionRule.html': 'test/fixtures/sampleWithWhitespace.html'
        },
        options: {
          exclusionPattern: /html/g
        }
      },
      customInclude: {
        files: {
          'tmp/sampleCustomInclusionRule.html': 'test/fixtures/sampleWithWhitespace.html'
        },
        options: {
          inclusionPattern: /html/g
        }
      },
      nonRegexPattern: {
        files: {
          'tmp/sampleCustomInclusionRuleNoRegexp.html': 'test/fixtures/sampleWithWhitespace.html'
        },
        options: {
          inclusionPattern: 'html'
        }
      },
      excludingAllLines: {
        files: {
          'tmp/fileShouldntBeCreated.html': 'test/fixtures/sampleWithWhitespace.html'
        },
        options: {
          exclusionPattern: /.*/g
        }
      }
    },
    nodeunit: {
      tests: ['test/*_test.js']
    },
    jshint: {
      dev: [
        'lib/*.js',
        'Gruntfile.js',
        'test/*.js'
      ]
    },
    watch: {
      dev: {
        files: [
          'lib/*.js',
          'Gruntfile.js'
        ],
        tasks: [
          'jshint:dev'
        ]
      }
    }
  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.registerTask('default', ['test']);
  grunt.registerTask('dev', ['watch']);
  grunt.registerTask('test', ['clean:test', 'lineremover', 'nodeunit']);
};