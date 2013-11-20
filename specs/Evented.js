define(function(require){
  'use strict';

  var bdd = require('intern!bdd');
  var expect = require('intern/chai!expect');
  var describe = bdd.describe;
  var it = bdd.it;
  var beforeEach = bdd.beforeEach;

  var on = require('../on');
  var emit = require('../emit');

  var Evented = require('../Evented');

  var evt = {
    name: 'test',
    bubbles: true,
    cancelable: true
  };

  describe('Evented Object', function(){
    var testObj;

    beforeEach(function(){
      testObj = new Evented();
    });

    it('should register events through an `on` method', function(){
      var remover = testObj.on('test', function(e){});
      expect(remover).not.to.be.an('undefined');
      expect(remover.remove).to.be.a('function');
    });

    it('should send events through an `emit` method', function(){
      var remover = testObj.on('test', function(e){
        expect(e).to.equal(evt);
      });
      testObj.emit('test', evt);
    });

  });

});
