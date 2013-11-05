(function(define){
  'use strict';

  define(function(require){

    var support = require('./support');
    var captures = support['event-focusin'] ? {} : {focusin: "focus", focusout: "blur"};

    /**
     * A function that provides core event listening functionality. With this function
     * you can provide a target, event type, and listener to be notified of
     * future matching events that are fired.
     * @example
     *   // To listen for "click" events on a button node, we can do:
     *   define(["dojo/on"], function(on){
     *     on(button, "click", clickHandler);
     *   });
     *   // Evented JavaScript objects can also have their own events.
     *   var obj = new Evented();
     *   on(obj, "foo", fooHandler);
     *   // And then we could publish a "foo" event:
     *   on.emit(obj, "foo", {key: "value"});
     *   // We can use extension events as well. For example, you could listen for a tap gesture:
     *   define(["dojo/on", "dojo/gesture/tap", function(on, tap){
     *     on(button, tap, tapHandler);
     *   });
     *   // which would trigger fooHandler. Note that for a simple object this is equivalent to calling:
     *   obj.onfoo({key:"value"});
     *   // If you use on.emit on a DOM node, it will use native event dispatching when possible.
     * @param  {Element|Object} target This is the target object or DOM element that to receive events from
     * @param  {String|Function} type This is the name of the event to listen for or an extension event type.
     * @param  {Function} listener This is the function that should be called when the event fires.
     * @return {Object} An object with a remove() method that can be used to stop listening for this event.
     */
    var on = function(target, type, listener){
      /* jshint eqeqeq: false */
      if(typeof target.on == "function" && typeof type != "function" && !target.nodeType){
        // delegate to the target's on() method, so it can handle it's own listening if it wants (unless it
        // is DOM node and we may be dealing with jQuery or Prototype's incompatible addition to the
        // Element prototype
        return target.on(type, listener);
      }
      // delegate to main listener code
      return on.parse(target, type, listener, addListener, this);
    };

    /**
     * This function acts the same as on(), but with pausable functionality. The
     * returned signal object has pause() and resume() functions. Calling the
     * pause() method will cause the listener to not be called for future events. Calling the
     * resume() method will cause the listener to again be called for future events.
     * @param  {Element|Object} target This is the target object or DOM element that to receive events from
     * @param  {String|Function} type This is the name of the event to listen for or an extension event type.
     * @param  {Function} listener This is the function that should be called when the event fires.
     * @return {Object} An object with a remove() method that can be used to stop listening for this event.
     */
    on.pausable =  function(target, type, listener){
      var paused;
      var signal = on(target, type, function(){
        if(!paused){
          return listener.apply(this, arguments);
        }
      });
      signal.pause = function(){
        paused = true;
      };
      signal.resume = function(){
        paused = false;
      };
      return signal;
    };

    /**
     * This function acts the same as on(), but will only call the listener once. The
     * listener will be called for the first event that takes place and then listener will automatically be removed.
     * @param  {Element|Object} target This is the target object or DOM element that to receive events from
     * @param  {String|Function} type This is the name of the event to listen for or an extension event type.
     * @param  {Function} listener This is the function that should be called when the event fires.
     * @return {Object} An object with a remove() method that can be used to stop listening for this event.
     */
    on.once = function(target, type, listener){
      var signal = on(target, type, function(){
        // remove this listener
        signal.remove();
        // proceed to call the listener
        return listener.apply(this, arguments);
      });
      return signal;
    };
    on.parse = function(target, type, listener, addListener, matchesTarget){
      if(type.call){
        // event handler function
        // on(node, touch.press, touchListener);
        return type.call(matchesTarget, target, listener);
      }

      if(type.indexOf(",") > -1){
        // we allow comma delimited event names, so you can register for multiple events at once
        var events = type.split(/\s*,\s*/);
        var handles = [];
        var i = 0;
        var eventName;
        while(eventName = events[i++]){
          handles.push(addListener(target, eventName, listener, matchesTarget));
        }
        handles.remove = function(){
          for(var i = 0; i < handles.length; i++){
            handles[i].remove();
          }
        };
        return handles;
      }
      return addListener(target, type, listener, matchesTarget);
    };
    var touchEvents = /^touch/;
    function addListener(target, type, listener, matchesTarget){
      // event delegation:
      var selector = type.match(/(.*):(.*)/);
      // if we have a selector:event, the last one is interpreted as an event, and we use event delegation
      if(selector){
        type = selector[2];
        selector = selector[1];
        // create the extension event for selectors and directly call it
        return on.selector(selector, type).call(matchesTarget, target, listener);
      }
      // test to see if it a touch event right now, so we don't have to do it every time it fires
      if(support['touch']){
        if(touchEvents.test(type)){
          // touch event, fix it
          listener = fixTouchListener(listener);
        }
        if(!support['event-orientationchange'] && (type == "orientationchange")){
          //"orientationchange" not supported <= Android 2.1,
          //but works through "resize" on window
          type = "resize";
          target = window;
          listener = fixTouchListener(listener);
        }
      }
      if(addStopImmediate){
        // add stopImmediatePropagation if it doesn't exist
        listener = addStopImmediate(listener);
      }
      // the target has addEventListener, which should be used if available (might or might not be a node, non-nodes can implement this method as well)
      // check for capture conversions
      var capture = type in captures,
        adjustedType = capture ? captures[type] : type;
      target.addEventListener(adjustedType, listener, capture);
      // create and return the signal
      return {
        remove: function(){
          target.removeEventListener(adjustedType, listener, capture);
        }
      };
    }

    /**
     * Creates a new extension event with event delegation. This is based on
     * the provided event type (can be extension event) that
     * only calls the listener when the CSS selector matches the target of the event.
     *
     * The application must require() an appropriate level of dojo/query to handle the selector.
     * @example
     *   require(["dojo/on", "dojo/mouse", "dojo/query!css2"], function(on, mouse){
     *     on(node, on.selector(".my-class", mouse.enter), handlerForMyHover);
     *   });
     * @param  {String|Function} selector  The CSS selector to use for filter events and determine the |this| of the event listener.
     * @param  {String|Function} eventType The event to listen for
     * @param  {Boolean} children  Indicates if children elements of the selector should be allowed. This defaults to true
     * @return {Object} An object with a remove() method that can be used to stop listening for this event.
     */
    on.selector = function(selector, eventType, children){
      return function(target, listener){
        // if the selector is function, use it to select the node, otherwise use the matches method
        var matchesTarget = typeof selector == "function" ? {matches: selector} : this,
          bubble = eventType.bubble;
        function select(eventTarget){
          // see if we have a valid matchesTarget or default to dojo.query
          matchesTarget = matchesTarget && matchesTarget.matches ? matchesTarget : {
            matches: function(eventTarget, selector, target){
              // dojo/query replacement
              var match = eventTarget.webkitMatchesSelector || eventTarget.mozMatchesSelector || eventTarget.msMatchesSelector || eventTarget.oMatchesSelector;
              return match.call(eventTarget, selector);
            }
          };
          // there is a selector, so make sure it matches
          if(eventTarget.nodeType != 1){
            // text node will fail in native match selector
            eventTarget = eventTarget.parentNode;
          }
          while(!matchesTarget.matches(eventTarget, selector, target)){
            if(eventTarget == target || children === false || !(eventTarget = eventTarget.parentNode) || eventTarget.nodeType != 1){ // intentional assignment
              return;
            }
          }
          return eventTarget;
        }
        if(bubble){
          // the event type doesn't naturally bubble, but has a bubbling form, use that, and give it the selector so it can perform the select itself
          return on(target, bubble(select), listener);
        }
        // standard event delegation
        return on(target, eventType, function(event){
          // call select to see if we match
          var eventTarget = select(event.target);
          // if it matches we call the listener
          return eventTarget && listener.call(eventTarget, event);
        });
      };
    };

    if(!support['event-stopimmediatepropagation']){
      var stopImmediatePropagation =function(){
        this.immediatelyStopped = true;
        this.modified = true; // mark it as modified so the event will be cached in IE
      };
      var addStopImmediate = function(listener){
        return function(event){
          if(!event.immediatelyStopped){// check to make sure it hasn't been stopped immediately
            event.stopImmediatePropagation = stopImmediatePropagation;
            return listener.apply(this, arguments);
          }
        };
      }
    }

    if(support['touch']){
      var Event = function(){};
      var windowOrientation = window.orientation;
      var fixTouchListener = function(listener){
        return function(originalEvent){
          //Event normalization(for ontouchxxx and resize):
          //1.incorrect e.pageX|pageY in iOS
          //2.there are no "e.rotation", "e.scale" and "onorientationchange" in Android
          //3.More TBD e.g. force | screenX | screenX | clientX | clientY | radiusX | radiusY

          // see if it has already been corrected
          var event = originalEvent.corrected;
          if(!event){
            var type = originalEvent.type;
            try{
              delete originalEvent.type; // on some JS engines (android), deleting properties make them mutable
            }catch(e){}
            if(originalEvent.type){
              // deleting properties doesn't work (older iOS), have to use delegation
              if(support['mozilla']){
                // Firefox doesn't like delegated properties, so we have to copy
                var event = {};
                for(var name in originalEvent){
                  event[name] = originalEvent[name];
                }
              }else{
                // old iOS branch
                Event.prototype = originalEvent;
                var event = new Event;
              }
              // have to delegate methods to make them work
              event.preventDefault = function(){
                originalEvent.preventDefault();
              };
              event.stopPropagation = function(){
                originalEvent.stopPropagation();
              };
            }else{
              // deletion worked, use property as is
              event = originalEvent;
              event.type = type;
            }
            originalEvent.corrected = event;
            if(type == 'resize'){
              if(windowOrientation == window.orientation){
                return null;//double tap causes an unexpected 'resize' in Android
              }
              windowOrientation = window.orientation;
              event.type = "orientationchange";
              return listener.call(this, event);
            }
            // We use the original event and augment, rather than doing an expensive mixin operation
            if(!("rotation" in event)){ // test to see if it has rotation
              event.rotation = 0;
              event.scale = 1;
            }
            //use event.changedTouches[0].pageX|pageY|screenX|screenY|clientX|clientY|target
            var firstChangeTouch = event.changedTouches[0];
            for(var i in firstChangeTouch){ // use for-in, we don't need to have dependency on dojo/_base/lang here
              delete event[i]; // delete it first to make it mutable
              event[i] = firstChangeTouch[i];
            }
          }
          return listener.call(this, event);
        };
      };
    }
    return on;
  });

}(
  typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
  // Boilerplate for AMD and Node
));
