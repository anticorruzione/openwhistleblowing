exports.config = {

  //To start a standalone Selenium Server locally

  seleniumServerJar: null,
  seleniumPort:null,
  seleniumArgs: [],
  chromeDriver: './selenium/chromedriver',

  //To connect to a Selenium Server which is already running
  seleniumAddress: 'http://127.0.0.1:4444/wd/hub',

  //To use remote browsers via Sauce Labs
  sauceUser: null,
  sauceKey: null,
  sauceSeleniumAddress: null,

  //To connect directly to Drivers

  directConnect: false,
  firefoxPath: null,
  chromeOnly: false,

  //What tests to run

  // Spec patterns are relative to this conf.js file
  specs: [
    'spec/*_spec.js',
  ]

  // Patterns to exclude
  exclude: [],


  suites: {
    smoke: 'spec/smoketests/*.js',
    full: 'spec/*.js'
  },

  // How to set up browsers, for more info on capabilities see https://code.google.com/p/selenium/wiki/DesiredCapabilities
  // You can also specify count, shardTestFiles, and maxInstances.

  capabilities: {
    browserName: 'chrome',
    count: 1,
    shardTestFiles: false,
    maxInstances: 1,
    specs: ['spec/chromOnlySpec.js']
    exclude: ['spec/doNotRunInChromeSpec.js']
  },

  multiCapabilities: [{
    'browserName': 'chrome',
    'count': 1,
    'shardTestFiles': false,
    'maxInstances': 1,
    } , {
    'browserName': 'firefox',
    'count': 2,
    'shardTestFiles': false,
    'maxInstances': 1,
    }
  ],

  //Maximum number of total browser sessions to run at the sme time

  maxSessions: -1,


  // ---------------------------------------------------------------------------
  // ----- Global test information ---------------------------------------------
  // ---------------------------------------------------------------------------

  baseUrl: 'http://localhost:5000',

  //CSS selector for the element housing the angular app
  rootElement: 'body',

  // Timeout of browser scripts
  allScriptsTimeout: 11000,

  //Page load timeout
  getPageTimeout: 10000,

  beforeLaunch: function() {
  },

  onPrepare: function() {
  },

  onComplete: function() {
  },

  onCleanUp: function(exitcode) {
  },

  afterLaunch: function() {
  },

  params: {
    login: {
      user: 'user',
      password: 'pass',
    }
  },

  framework: 'jasmine',

  jasmineNodeOpts: {
    isVerbose: false,
    showColors: true,
    includeStackTrace: true,
    defaultTimeoutInterval: 30000
  },

  mochaOpts: {
    ui: 'bdd',
    reporter: 'list'
  },

  cucumberOpts: {
    require: 'cucumber/stepDefinitions.js',
    tags: '@dev',
    format: 'summary'
  }
}
