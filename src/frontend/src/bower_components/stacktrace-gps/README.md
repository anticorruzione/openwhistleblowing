stacktrace-gps - Turn partial code location into precise code location
===================
[![Build Status](https://travis-ci.org/stacktracejs/stacktrace-gps.svg?branch=master)](https://travis-ci.org/stacktracejs/stacktrace-gps) [![Coverage Status](https://img.shields.io/coveralls/stacktracejs/stacktrace-gps.svg)](https://coveralls.io/r/stacktracejs/stacktrace-gps) [![Code Climate](https://codeclimate.com/github/stacktracejs/stacktrace-gps/badges/gpa.svg)](https://codeclimate.com/github/stacktracejs/stacktrace-gps)

This library accepts a code location (in the form of a [StackFrame](https://github.com/stacktracejs/stackframe)) and 
returns a new StackFrame with a more accurate location (using [source maps](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/)) and guessed function names.

## Usage
```js
var stackframe = new StackFrame(undefined, [], 'http://localhost:3000/file.min.js', 1, 3284);
var callback = function myCallback(foundFunctionName) { console.log(foundFunctionName); };

// Such meta. Wow
var errback = function myErrback(error) { console.log(StackTrace.fromError(error)); };

var gps = new StackTraceGPS();

// Pinpoint actual function name and source-mapped location
gps.pinpoint(stackframe).then(callback, errback);
=> Promise(StackFrame('fun', [], 'file.js', 203, 9), Error)

// Better location/name information from source maps
gps.getMappedLocation(stackframe).then(callback, errback);
=> Promise(StackFrame(undefined, [], 'file.js', 203, 9), Error)

// Get function name from location information
gps.findFunctionName(stackframe).then(callback, errback);
=> Promise(StackFrame('fun', [], 'http://localhost:3000/file.min.js', 1, 3284), Error)
```

## Installation
```
npm install stacktrace-gps
bower install stacktrace-gps
https://raw.githubusercontent.com/stacktracejs/stacktrace-gps/master/dist/stacktrace-gps.min.js
```

## API

#### `new StackTraceGPS(/*optional*/ options)` => StackTraceGPS
options: Object
* **sourceCache: Object (String URL => String Source)** - Pre-populate source cache to avoid network requests
* **offline: Boolean (default false)** - Set to `true` to prevent all network requests
 
#### `.pinpoint(stackframe)` => Promise(StackFrame)
Enhance function name and use source maps to produce a better StackFrame.
* **stackframe** - [StackFrame](https://github.com/stacktracejs/stackframe) or like object 
e.g. {fileName: 'path/to/file.js', lineNumber: 100, columnNumber: 5}
 
#### `.findFunctionName(stackframe)` => Promise(StackFrame)
Enhance function name and use source maps to produce a better StackFrame.
* **stackframe** - [StackFrame](https://github.com/stacktracejs/stackframe) or like object
 
#### `.getMappedLocation(stackframe)` => Promise(StackFrame)
Enhance function name and use source maps to produce a better StackFrame.
* **stackframe** - [StackFrame](https://github.com/stacktracejs/stackframe) or like object

## Browser Support
Functions that rely on [Source Maps](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/)
(`pinpoint` and `getMappedLocation`) require recent browsers:

* Chrome 20+
* Firefox 23+
* Safari 8+
* Opera 24+
* IE 9+
* iOS 7+
* Android 4.2+

## Contributing
Want to be listed as a *Contributor*? Start with the [Contributing Guide](CONTRIBUTING.md)!

## License
This project is licensed to the [Public Domain](http://unlicense.org)
