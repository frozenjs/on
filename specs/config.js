// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define(function(){
  var suites = [
    'on/specs/on',
    'on/specs/emit',
    'on/specs/Evented'
  ];

  if(typeof process === 'undefined'){
    suites.push('on/specs/dom', 'on/specs/dojo');
  }

  var config = {
    // The port on which the instrumenting proxy will listen
    proxyPort: 9000,

    // A fully qualified URL to the Intern proxy
    proxyUrl: 'http://localhost:9000/',

    // Default desired capabilities for all environments. Individual capabilities can be overridden by any of the
    // specified browser environments in the `environments` array below as well. See
    // https://code.google.com/p/selenium/wiki/DesiredCapabilities for standard Selenium capabilities and
    // https://saucelabs.com/docs/additional-config#desired-capabilities for Sauce Labs capabilities.
    // Note that the `build` capability will be filled in with the current commit ID from the Travis CI environment
    // automatically
    capabilities: {
      name: 'frozen-on',
      'selenium-version': '2.37.0',
      build: new Date()
    },

    // Browsers to run integration testing against. Note that version numbers must be strings if used with Sauce
    // OnDemand. Options that will be permutated are browserName, version, platform, and platformVersion; any other
    // capabilities options specified for an environment will be copied as-is
    environments: [
      // ie
      { browserName: 'internet explorer', version: '11', platform: 'Windows 8.1' },
      { browserName: 'internet explorer', version: '10', platform: 'Windows 8' },
      { browserName: 'internet explorer', version: '9', platform: 'Windows 7' },
      // firefox
      { browserName: 'firefox', version: '25', platform: [ 'OS X 10.6', 'Windows 7' ] },
      { browserName: 'firefox', version: '24', platform: 'Linux' },
      // chrome
      { browserName: 'chrome', version: ['31', '30', '29', '28', '27', '26'], platform: 'Windows 8.1' },
      { browserName: 'chrome', version: '', platform: [ 'Linux', 'OS X 10.6', 'OS X 10.8'] },
      // safari
      { browserName: 'safari', version: '5', platform: 'OS X 10.6' },
      { browserName: 'safari', version: '6', platform: 'OS X 10.8' },
      // android
      { browserName: 'android', version: '4', platform: 'Linux', 'device-orientation': 'portrait' },
      { browserName: 'android', version: '4', platform: 'Linux', 'device-type': 'tablet', 'device-orientation': 'portrait' }
      // { browserName: 'iphone', version: '6', platform: 'OS X 10.8', 'device-orientation': 'portrait' }
      // { browserName: 'phantom', version: '', platform: 'phantom' }
    ],

    // Maximum number of simultaneous integration tests that should be executed on the remote WebDriver service
    maxConcurrency: 3,

    // Whether or not to start Sauce Connect before running tests
    useSauceConnect: true,

    // Connection information for the remote WebDriver service. If using Sauce Labs, keep your username and password
    // in the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables unless you are sure you will NEVER be
    // publishing this configuration file somewhere
    webdriver: {
      host: 'localhost',
      port: 4444
    },

    // The desired AMD loader to use when running unit tests (client.html/client.js). Omit to use the default Dojo
    // loader
    useLoader: {
      'host-node': 'dojo/dojo',
      'host-browser': 'node_modules/dojo/dojo.js'
    },

    // Configuration options for the module loader; any AMD configuration options supported by the specified AMD loader
    // can be used here
    loader: {
      paths: {
        sinon: 'node_modules/sinon/pkg/sinon-1.7.3.js'
      },
      // Packages that should be registered with the loader in each testing environment
      packages: [
        { name: 'on', location: '.' },
        { name: 'meld', location: 'node_modules/meld', main: 'meld' },
        { name: 'sinon-chai', location: 'node_modules/sinon-chai/lib', main: 'sinon-chai' },
        { name: 'chai', location: 'node_modules/intern/node_modules/chai', main: 'chai' }
      ]
    },

    // Non-functional test suite(s) to run in each browser
    suites: suites,

    // Functional test suite(s) to run in each browser once non-functional tests are completed
    functionalSuites: [ /* 'myPackage/tests/functional' */ ],

    // A regular expression matching URLs to files that should not be included in code coverage analysis
    excludeInstrumentation: /^(?:specs|node_modules)\//
  };

  return config;

});
