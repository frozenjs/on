(function(buster, define) {
  'use strict';

  define(function(require){
    var on = require('../on');
    var emit = require('../emit');

    var Evented = require('../Evented');

    buster.spec.expose();

    var expect = buster.expect;

    var evt = {
      name: 'test',
      bubbles: true,
      cancelable: true
    };

    describe('Evented Object', function(){
      var testObj;

      before(function(){
        testObj = new Evented();
      });

      it('should register events through an `on` method', function(){
        var remover = testObj.on('test', function(e){});
        expect(remover).toBeDefined();
        expect(remover.remove).toBeFunction();
      });

      it('should send events through an `emit` method', function(){
        var remover = testObj.on('test', function(e){
          expect(e).toBe(evt);
        });
        testObj.emit('test', evt);
      });

    });

  });

})(
  this.buster || require('buster'),
  typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
);
