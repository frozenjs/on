var config = exports;

config['Base'] = {
  rootPath: '../',
  tests: [
    'spec/on.js',
    'spec/emit.js',
    'spec/Evented.js'
  ]
};

config['Node'] = {
  extends: 'Base',
  environment: 'node'
};

config['Browser'] = {
  extends: 'Base',
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
    'spec/dom.js'
  ]
};
