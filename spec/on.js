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

    describe('On', function(){

      it('should register events on the Evented object using the `on` method of that object', function(){
        var testObj = new Evented();
        on(testObj, 'test', function(e){
          expect(e).toBe(evt);
        });
        on(testObj, 'test', function(e){
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
