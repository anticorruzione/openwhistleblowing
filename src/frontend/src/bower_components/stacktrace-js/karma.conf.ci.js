module.exports = function (config) {
    'use strict';
    if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
        console.log('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.');
        process.exit(1);
    }

    // Commented some of these out just so CI doesn't take forever.
    // Check out https://saucelabs.com/platforms for all browser/platform combos
    var customLaunchers = {
        slIOS8: {
            base: 'SauceLabs',
            browserName: 'iPhone',
            platform: 'OS X 10.10',
            version: '8.4'
        },
        slIOS9: {
            base: 'SauceLabs',
            browserName: 'iPhone',
            platform: 'OS X 10.11',
            version: '9.1'
        },
        slAndroid4: {
            base: 'SauceLabs',
            browserName: 'Android',
            platform: 'Linux',
            version: '4.4'
        },
        slAndroid5: {
            base: 'SauceLabs',
            browserName: 'Android',
            platform: 'Linux',
            version: '5.1'
        },
        slChrome: {
            base: 'SauceLabs',
            browserName: 'chrome'
        },
        slChromeBeta: {
            base: 'SauceLabs',
            browserName: 'chrome',
            version: 'beta'
        },
        slChromeCanary: {
            base: 'SauceLabs',
            browserName: 'chrome',
            version: 'dev'
        },
        slFirefox42: {
            base: 'SauceLabs',
            browserName: 'firefox',
            platform: 'Windows 8.1',
            version: '43.0'
        },
        slFirefoxDev: {
            base: 'SauceLabs',
            browserName: 'firefox',
            version: 'dev'
        },
        slSafari8: {
            base: 'SauceLabs',
            browserName: 'safari',
            platform: 'OS X 10.10',
            version: '8'
        },
        slSafari9: {
            base: 'SauceLabs',
            browserName: 'safari',
            platform: 'OS X 10.11',
            version: '9'
        },
        slOpera: {
            base: 'SauceLabs',
            browserName: 'opera'
        },
        slEdge20: {
            base: 'SauceLabs',
            browserName: 'microsoftedge',
            platform: 'Windows 10',
            version: '20.10240'
        },
        slIE11: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 8.1',
            version: '11'
        },
        slIE10: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 8',
            version: '10'
        },
        slIE9: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 7',
            version: '9'
        }
        // Commented out due to lack of polyfills for SourceMapConsumer
        //slIE8: {
        //    base: 'SauceLabs',
        //    browserName: 'internet explorer',
        //    platform: 'Windows XP',
        //    version: '8'
        //},
        //slIE7: {
        //    base: 'SauceLabs',
        //    browserName: 'internet explorer',
        //    platform: 'Windows XP',
        //    version: '7'
        //}
    };

    config.set({
        basePath: '',
        frameworks: ['jasmine-ajax', 'jasmine'],
        files: [
            'node_modules/es6-promise/dist/es6-promise.js',
            'polyfills.js',
            'node_modules/stacktrace-gps/dist/stacktrace-gps.min.js',
            'node_modules/error-stack-parser/dist/error-stack-parser.js',
            'node_modules/stack-generator/dist/stack-generator.js',
            'stacktrace.js',
            'spec/fixtures/*.js',
            'spec/spec-helper.js',
            'spec/*-spec.js'
        ],
        exclude: [],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browserDisconnectTimeout : 10000,
        browserDisconnectTolerance : 1,
        browserNoActivityTimeout : 240000,
        captureTimeout : 240000,
        sauceLabs: {
            testName: 'stacktrace.js unit tests',
            recordScreenshots: false,
            connectOptions: {
                port: 5757,
                logfile: 'sauce_connect.log'
            }
        },
        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers),
        reporters: ['progress', 'saucelabs', 'coverage'],
        preprocessors: {
            'stacktrace.js': 'coverage'
        },
        coverageReporter: {
            type: 'lcov',
            dir: 'coverage'
        },
        singleRun: true
    });
};
