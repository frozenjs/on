curl.config({
  baseUrl: './',
  apiName: 'require',
  packages: [
    { name: 'meld', location: 'node_modules/meld', main: 'meld' },
    { name: 'curl', location: 'node_modules/curl/src/curl', main: 'curl' }
  ]
});
