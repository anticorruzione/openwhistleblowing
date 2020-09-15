# dargs-object

> Converts an object of options into an array of command-line arguments

Basically the inverse of an argument parser like nopt or minimist.

>Forked from https://github.com/sindresorhus/dargs

## Install

```bash
$ npm install --save dargs-object
```


#### Example

```js
var dargs = require('dargs-object');

var obj = {
	foo: 'bar',
	hello: true,                    // results in only the key being used
	cake: false,                    // ignored
	camelCase: 5,                   // camelCase is slugged to `camel-case`
	multiple: ['value', 'value2'],  // converted to multiple arguments
	object: {test:'value'},
	sad: ':('
};

var options={
	excludes:['sad'],
	convertCamelCase:true,
	joinLists:false
};
console.log(dargs(obj, options));

/*
[
	'--foo', 'bar',
	'--hello',
	'--camel-case', '5',
	'--multiple', 'value',
	'--multiple', 'value2',
	'--object.test', 'value'
]
*/
```


## API

### dargs(obj, options)

#### obj

Type: `Object`

an object containing options to convert to command-line arguments.

#### options

Type: `Object`

Properties:

- excludes: Keys to exclude.
- joinLists: If false (default), array values will generate multiple flags: '--list thing1 --list thing2 --list thing3'. If true, array values will be passed, delimited, to a single flag: '--list thing1,thing2,thing3'.
- convertCamelCase (default: false): Convert camelCase flags to camel-case


## License

[MIT](http://opensource.org/licenses/MIT) © [Ryan Bridges](http://fasterness.com), based off the original dargs by [Sindre Sorhus](http://sindresorhus.com)
