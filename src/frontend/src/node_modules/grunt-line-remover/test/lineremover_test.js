'use strict';

var grunt = require('grunt');

exports.lineremover = {

  noOptions: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/sampleWithoutWhitespace.html');
    var expected = grunt.file.read('test/expected/sampleWithoutWhitespace.html');
    test.equal(actual, expected, 'Should have removed whitespace lines in file');

    test.done();
  },

  customInclusion: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/sampleCustomInclusionRule.html');
    var expected = grunt.file.read('test/expected/sampleCustomInclusionRule.html');
    test.equal(actual, expected, 'Should have removed lines using custom inclusion rule');

    test.done();
  },

  customExclusion: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/sampleExclusionRule.html');
    var expected = grunt.file.read('test/expected/sampleCustomExclusionRule.html');
    test.equal(actual, expected, 'Should have removed lines using custom exclusion rule');

    test.done();
  },

  customWithoutRegexp: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/sampleCustomInclusionRuleNoRegexp.html');
    var expected = grunt.file.read('test/expected/sampleCustomInclusionRule.html');
    test.equal(actual, expected, 'Should have removed lines using a non-regex option passed in');

    test.done();
  },

  allLinesExcluded: function(test) {
    test.expect(1);

    var doesExist = grunt.file.exists('tmp/fileShouldntBeCreated.html');
    test.equal(doesExist, false, 'File with all lines excluded should not be generated');

    test.done();
  }

};