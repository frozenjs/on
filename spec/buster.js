var config = exports;

config.base = {
  rootPath: '../',
  tests: [
    'spec/on-spec.js',
    'spec/emit-spec.js',
    'spec/Evented-spec.js'
  ]
};

config.node = {
  extends: 'base',
  environment: 'node'
};

config.browser = {
  extends: 'base',
  environment: 'browser',
  extensions: [require('buster-amd')],
  libs: [
    'node_modules/curl/src/curl.js',
    'spec/curl-config.js'
  ],
  resources: [
    '*.js',
    'node_modules/meld/**/*.js'
  ],
  tests: [
    'spec/dojo-spec.js',
    'spec/dom-spec.js'
  ]
};
