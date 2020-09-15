/*
 * grunt-confirm
 * https://github.com/anseki/grunt-confirm
 *
 * Copyright (c) 2016 anseki
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var readlineSync = require('readline-sync'),
    RE_CTRL_CHAR = /\x1B\[\d+m/,
    HL_IN = '\x1B[1m', HL_OUT = '\x1B[22m';

  // Wrap handler.
  function callHandler(handler, argsArray, handlerClass) {
    try {
      return handler.apply(grunt.task.current, argsArray);
    } catch (e) {
      grunt.log.error('"' + handlerClass + '" failed.');
      grunt.fail.fatal(e);
    }
  }

  grunt.registerMultiTask('confirm',
    'Abort or continue the flow of tasks according to an answer (with or without' +
      ' Enter key) to the specified question.', function() {

    var that = this, options = that.options(), query, filesArray, matches,
      res, rlsMethod, rlsOptions = {history: false};

    function getFiles() {
      if (!filesArray) {
        filesArray = [];
        that.files.forEach(function(f) {
          var srcArray = f.src.filter(function(filepath) {
            // Warn on and remove invalid source files (if nonull was set).
            if (!grunt.file.exists(filepath)) {
              grunt.log.warn('Source file "' + filepath + '" not found.');
              return false;
            } else {
              return true;
            }
          });
          // Grunt does not support empty src.
          if (srcArray.length) { filesArray.push({src: srcArray, dest: f.dest}); }
        });
      }
      return filesArray;
    }

    function hl(text) {
      return !(text += '') || RE_CTRL_CHAR.test(text) ? text : HL_IN + text + HL_OUT;
    }

    if (typeof options.question === 'function') {
      query = callHandler(options.question, [getFiles()], 'question');
      if (!query) { return; } // Do nothing.
    } else {
      query = options.question ?
        options.question + ' :' : options.question; // accept ''
    }

    if ((matches = /^\s*_key(?:\:(.+))?\s*$/i.exec(options.input + ''))) {
      rlsMethod = 'keyIn';
      if (matches[1]) { rlsOptions.trueValue = matches[1]; }
      else if (typeof options.proceed !== 'function' &&
        typeof options.proceed !== 'boolean') { rlsMethod = 'keyInPause'; }
    } else {
      rlsMethod = 'question';
      if (options.input) { rlsOptions.trueValue = (options.input + '').split(','); }
    }

    res = readlineSync[rlsMethod](query && process.platform !== 'win32' ?
      hl(query) : query, rlsOptions); // accept undefined
    if (!(rlsOptions.trueValue ? res === true :
        typeof options.proceed === 'function' ?
          callHandler(options.proceed, [res, getFiles()], 'proceed') :
        typeof options.proceed === 'boolean' ? options.proceed : true)) {
      grunt.log.ok(hl('Tasks are aborted.'));
      grunt.task.clearQueue();
    }
  });
};
