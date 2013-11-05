#!/usr/bin/env node

'use strict';

if(process.platform !== 'darwin'){
  console.error('Automatic launch only working on OSX');
  process.exit(1);
}

var spawn = require('child_process').spawn;
var opn = require('open');

var busterServer = spawn('node_modules/.bin/buster-server', []);
busterServer.stdout.pipe(process.stdout);
busterServer.stderr.pipe(process.stderr);
busterServer.stdout.on('data', function(data){
  opn('http://localhost:1111/capture', 'safari');
  opn('http://localhost:1111/capture', 'firefox');
  // opn('http://localhost:1111/capture', 'firefoxaurora');
  // opn('http://localhost:1111/capture', 'firefoxnightly');
  opn('http://localhost:1111/capture', 'google chrome');

  var busterTest = spawn('node_modules/.bin/buster-test', ['-e', 'browser', '-r', 'specification']);
  busterTest.stdout.pipe(process.stdout);
  busterTest.stderr.pipe(process.stderr);
  busterTest.on('close', function(code){
    busterServer.kill();
    process.exit(code);
  });
});
