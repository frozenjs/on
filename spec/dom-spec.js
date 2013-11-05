(function(buster, define) {
  'use strict';

  define(function(require){
    var on = require('../on');
    var emit = require('../emit');

    buster.spec.expose();

    var expect = buster.expect;
    var assert = buster.assert;
    var refute = buster.refute;

    var evt = new CustomEvent('test', {
      bubbles: true,
      cancelable: true
    });

    describe('DOM Events', function(){
      var testEl;
      var noop;

      before(function(){
        testEl = document.createElement('div');
        noop = function noop(){};
      });

      describe('On', function(){

        it('should register a handler for custom event on a DOM element', function(){
          this.spy(testEl, 'addEventListener');
          on(testEl, 'test', noop);
          expect(testEl.addEventListener).toHaveBeenCalled();
        });

        it('should return a remover function that detaches handler on evocation', function(){
          this.spy(testEl, 'removeEventListener');
          var remover = on(testEl, 'test', noop);
          expect(remover).toBeDefined();
          expect(remover.remove).toBeFunction();
          remover.remove();
          expect(testEl.removeEventListener).toHaveBeenCalled();
          expect(testEl.removeEventListener).toHaveBeenCalledWith('test');
        });

      });

      describe('Emit', function(){

        it('should emit a custom event on a DOM element', function(){
          this.spy(testEl, 'dispatchEvent');
          on(testEl, 'test', function(e){
            expect(e).toHavePrototype(CustomEvent.prototype);
            expect(e.type).toBe(evt.type);
          });
          on(testEl, 'test', function(e){
            expect(e).toHavePrototype(CustomEvent.prototype);
            expect(e.type).toBe(evt.type);
          });
          emit(testEl, 'test', evt);
          expect(testEl.dispatchEvent).toHaveBeenCalled();
        });

      });

    });

  });

})(
  this.buster || require('buster'),
  typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
);
