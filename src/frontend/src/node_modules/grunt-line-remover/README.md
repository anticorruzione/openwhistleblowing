# grunt-line-remover [![Build Status](https://travis-ci.org/davidtucker/grunt-line-remover.png)](https://travis-ci.org/davidtucker/grunt-line-remover) 

> Removed Lines for Files of Any Type Using Regular Expressions That You Define

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-line-remover --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-line-remover');
```

## lineremover task
_Run this task with the `grunt lineremover` command._

Removes lines from the files passed in using either an inclusion or exclusion regular expression pattern.

### Options

All options assume that you are passing in either a RegExp instance or a string (which will be wrapped in ```new RegExp()```).  Also, note that if all lines are removed from a file, the result will not be put into the destination file (as that file would be empty).

#### inclusionPattern

Type: `RegExp`  
Default: `/\S/g`

Does not remove lines that meet the pattern that is passed in.  By default, this task uses an inclusion rule that includes non-whitespace characters.  This means, that by default the task removes all lines that contain only whitespace.

#### exclusionPattern

Type: `Boolean`  
Default: `none`

Removes lines that meet the pattern that is passed in.

#### Example config

```javascript
grunt.initConfig({
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
  }
});
```