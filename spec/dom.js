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

    describe('Dojo Tests', function(){
      var query;

      it('should pass the Dojo dom tests', function(){
        var div = document.body.appendChild(document.createElement("div"));
        var span = div.appendChild(document.createElement("span"));

        var order = [];
        var signal = on(div,"custom", function(event){
          order.push(event.detail.a);
          event.addedProp += "ue";
        });
        on(span,"custom", function(event){
          event.addedProp = "val";
        });
        emit(div, "custom", {
          target: div,
          currentTarget:div,
          relatedTarget: div,
          detail: {
            a: 0
          }
        });
        emit(div, "otherevent", {
          detail: {
            a: 0
          }
        });
        assert.equals(emit(span, "custom", {
          detail: {
            a: 1
          },
          bubbles: true,
          cancelable: true
        }).addedProp, "value");
        assert(emit(span, "custom", {
          detail: {
            a: 1
          },
          bubbles: false,
          cancelable: true
        }));
        var signal2 = on.pausable(div,"custom", function(event){
          order.push(event.detail.a + 1);
          event.preventDefault();
        });
        refute(emit(span, "custom", {
          detail: {
            a: 2
          },
          bubbles: true,
          cancelable: true
        }));
        signal2.pause();
        assert.equals(emit(span, "custom", {
          detail: {
            a: 4
          },
          bubbles: true,
          cancelable: true
        }).type, "custom");
        signal2.resume();
        signal.remove();
        refute(emit(span, "custom", {
          detail: {
            a: 4
          },
          bubbles: true,
          cancelable: true
        }));
        on(span, "custom", function(event){
          order.push(6);
          event.stopPropagation();
        });
        assert(emit(span, "custom", {
          detail: {
            a: 1
          },
          bubbles: true,
          cancelable: true
        }));

        // make sure we are propagating natively created events too, and that defaultPrevented works
        var button = span.appendChild(document.createElement("button")),
          defaultPrevented = false,
          signal2Fired = false;
        signal = on(span, "click", function(event){
          event.preventDefault();
        });
        signal2 = on(div, "click", function(event){
          order.push(7);
          signal2Fired = true;
          defaultPrevented = event.defaultPrevented;
        });
        button.click();
        assert(signal2Fired, "bubbled click event on div");
        assert(defaultPrevented, "defaultPrevented for click event");
        signal.remove();
        signal2.remove();

        // make sure that evt.defaultPrevented gets set for synthetic events too
        signal = on(span, "click", function(event){
          event.preventDefault();
        });
        signal2 = on(div, "click", function(event){
          signal2Fired = true;
          defaultPrevented = event.defaultPrevented;
        });
        signal2Fired = false;
        emit(button, "click", {bubbles: true, cancelable: true});
        assert(signal2Fired, "bubbled synthetic event on div");
        assert(defaultPrevented, "defaultPrevented set for synthetic event on div");
        signal.remove();
        signal2.remove();

        // test out event delegation
        // TODO: add event delegation
        if(query){
          // if dojo.query is loaded, test event delegation

          // check text node target is properly handled by event delegation
          var textnodespan = div.appendChild(document.createElement("span"));
          textnodespan.className = "textnode";
          textnodespan.innerHTML = "text";
          on(document.body, ".textnode:click", function(){
            order.push(8);
          });
          emit(textnodespan.firstChild, "click", {bubbles: true, cancelable: true});

          on(div, "button:click", function(){
            order.push(9);
          });
          on(document, "button:click", function(){
          }); // just make sure this doesn't throw an error
        }else{//just pass then
          order.push(8, 9);
        }
        // test out event delegation using a custom selector
        on(div, on.selector(function(node){
          return node.tagName == "BUTTON";
        }, "click"), function(){
          order.push(10);
        });
        button.click();
        assert.equals([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], order);
        on(span, "propertychange", function(){}); // make sure it doesn't throw an error
      });

      it('should pass the Dojo extension event tests', function(){
        var div = document.body.appendChild(document.createElement("div"));
        var span = div.appendChild(document.createElement("span"));
        span.setAttribute("foo", 2);
        var order = [];
        var customEvent = function(target, listener){
          return on(target, "custom", listener);
        };
        on(div, customEvent, function(event){
          order.push(event.detail.a);
        });
        on(div, on.selector("span", customEvent), function(event){
          order.push(+this.getAttribute("foo"));
        });
        emit(div, "custom", {
          detail: {
            a: 0
          }
        });
        // should trigger selector
        assert(emit(span, "custom", {
          detail: {
            a: 1
          },
          bubbles: true,
          cancelable: true
        }));
        // shouldn't trigger selector
        assert(emit(div, "custom", {
          detail: {
            a: 3
          },
          bubbles: true,
          cancelable: true
        }));
        assert.equals(order, [0, 1, 2, 3]);
      });

      it('should pass the Dojo stop immediate propagation tests', function(){
        var button = document.body.appendChild(document.createElement("button"));
        on(button, "click", function(event){
          event.stopImmediatePropagation();
        });
        var afterStop = false;
        on(button, "click", function(event){
          afterStop = true;
        });
        button.click();
        refute(afterStop);
      });

      it('should pass the Dojo event augmentation tests', function(){
        var div = document.body.appendChild(document.createElement("div"));
        var button = div.appendChild(document.createElement("button"));
        on(button, "click", function(event){
          event.modified = true;
          event.test = 3;
        });
        var testValue;
        on(div, "click", function(event){
          testValue = event.test;
        });
        button.click();
        assert.equals(testValue, 3);
      });

    });

  });

})(
  this.buster || require('buster'),
  typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
);
