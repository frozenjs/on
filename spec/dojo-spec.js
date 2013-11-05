(function(buster, define) {
  'use strict';

  define(function(require){
    var on = require('../on');
    var emit = require('../emit');
    var Evented = require('../Evented');

    buster.spec.expose();

    var expect = buster.expect;
    var assert = buster.assert;
    var refute = buster.refute;

    describe('Dojo Tests', function(){
      var query;

      var div;
      var span;
      var button;

      before(function(){
        div = document.body.appendChild(document.createElement("div"));
        span = div.appendChild(document.createElement("span"));
        button = div.appendChild(document.createElement("button"));
      });

      after(function(){
        document.body.removeChild(div);
      });

      it('should pass the Dojo dom tests', function(){
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
