define(function(require){
  'use strict';

  var bdd = require('intern!bdd');
  var expect = require('intern/chai!expect');
  var describe = bdd.describe;
  var it = bdd.it;

  var on = require('../main');
  var emit = require('../emit');

  var Evented = require('../Evented');

  var evt = {
    name: 'test',
    bubbles: true,
    cancelable: true
  };

  describe('On', function(){

    it('should register events on the Evented object using the `on` method of that object', function(){
      var testObj = new Evented();
      on(testObj, 'test', function(e){
        expect(e).to.equal(evt);
      });
      on(testObj, 'test', function(e){
        expect(e).to.equal(evt);
      });
      testObj.emit('test', evt);
    });

  });

});
