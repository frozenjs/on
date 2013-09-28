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

      describe('Dojo Tests', function(){

        it('should pass the Dojo object tests', function(){
          var order = [];
          var obj = new Evented();
          obj.oncustom = function(event){
            order.push(event.a);
            return event.a+1;
          };
          var signal = on.pausable(obj, "custom", function(event){
            order.push(0);
            return event.a+1;
          });
          obj.oncustom({a:0});
          var signal2 = on(obj, "custom, foo", function(event){
            order.push(event.a);
          });
          emit(obj, "custom", {
            a: 3
          });
          signal.pause();
          var signal3 = on(obj, "custom", function(a){
            order.push(3);
          }, true);
          emit(obj, "custom", {
            a: 3
          });
          signal2.remove();
          signal.resume();
          emit(obj, "custom", {
            a: 6
          });
          signal3.remove();
          var signal4 = on(obj, "foo, custom", function(a){
            order.push(4);
          }, true);
          signal.remove();
          emit(obj, "custom", {
            a: 7
          });
          expect(order).toEqual([0,0,3,0,3,3,3,3,6,0,3,7,4]);
        });
      });

      it('should pass the Dojo once tests', function(){
        var order = [];
        var obj = new Evented();
        obj.on("custom", function(event){
          order.push(event.a);
        });
        var signal = on.once(obj, "custom", function(event){
          order.push(1);
        });
        obj.emit("custom",{a:0});
        obj.oncustom({a:2}); // should call original method, but not listener
        expect(order).toEqual([0,1,2]);
      });

    });

  });

})(
  this.buster || require('buster'),
  typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
);
