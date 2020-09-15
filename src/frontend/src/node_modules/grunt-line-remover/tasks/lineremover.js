module.exports = function(grunt) {

  'use strict';

  grunt.registerMultiTask('lineremover', 'Remove Lines from Files', function() {

    var options = this.options();
    grunt.verbose.writeflags(options, 'Options');
    var _ = grunt.util._;
    var pattern;

    options = _.defaults(options, {
      inclusionPattern: /\S/g
    });

    pattern = options.exclusionPattern || options.inclusionPattern;
    if(!pattern instanceof RegExp) {
      grunt.log.debug("Value passed in was not RegExp Type. Creating New RegExp with String Passed In.");
      pattern = new RegExp(pattern);
    }

    var evaluatePattern = function(line, outputLines) {
      if (options.hasOwnProperty('exclusionPattern')) {
        if (!line.match(pattern)) {
          outputLines.push(line);
        }
      } else {
        if (line.match(pattern)) {
          outputLines.push(line);
        }
      }
    };

    this.files.forEach(function(file) {
      var lines;
      var outputLines = [];
      var output = "";

      var fileContents = file.src.filter(function(filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.writeln('X '.red + filepath + ' not found.');
          return false;
        } else {
          return true;
        }
      })
      .map(grunt.file.read)
      .join(grunt.util.linefeed);

      if(!fileContents) {
        grunt.log.writeln('X '.red + file.src + ' not found or contained no content.');
        return;
      }

      lines = fileContents.split(grunt.util.linefeed);
      lines.forEach(function(line) {
        evaluatePattern(line, outputLines);
      });

      if (outputLines.length < 1) {
        grunt.log.writeln('X '.red + file.dest + '" Destination not written because no lines were remaining.');
      } else {
        output = outputLines.join(grunt.util.linefeed);
        grunt.file.write(file.dest, output);
        var savedMsg = "removed " + (lines.length - outputLines.length) + " lines";
        grunt.log.writeln('✔ '.green + file.dest + (' (' + savedMsg + ')').grey);
      }
    });

  });

};