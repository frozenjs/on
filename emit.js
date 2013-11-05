(function(define){
  'use strict';

  define(function(require){

    var support = require('./support');

    var CustomEvent = CustomEvent || function(event, params){
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };

    function syntheticPreventDefault(){
      this.cancelable = false;
      this.defaultPrevented = true;
    }
    function syntheticStopPropagation(){
      this.bubbles = false;
    }

    var slice = [].slice;
    var emit;

    /**
     * Fires an event on the target object.
     *
     * Note that this is designed to emit events for listeners registered through
     * dojo/on. It should actually work with any event listener except those
     * added through IE's attachEvent (IE8 and below's non-W3C event emitting
     * doesn't support custom event types). It should work with all events registered
     * through dojo/on. Also note that the emit method does do any default
     * action, it only returns a value to indicate if the default action should take
     * place. For example, emitting a keypress event would not cause a character
     * to appear in a textbox.
     * @example
     *   // To fire our own click event
     *   on.emit(dojo.byId('button'), 'click', {
     *     cancelable: true,
     *     bubbles: true,
     *     screenX: 33,
     *     screenY: 44
     *   });
     *   // We can also fire our own custom events:
     *   on.emit(dojo.byId('slider'), 'slide', {
     *     cancelable: true,
     *     bubbles: true,
     *     direction: 'left-to-right'
     *   });
     * @param {Element|Object} target - The target object to fire the event on. This can be a DOM element or a plain JS object. If the target is a DOM element, native event emitting mechanisms are used when possible.
     * @param {String} type - The event type name. You can emulate standard native events like 'click' and 'mouseover' or create custom events like 'open' or 'finish'.
     * @param {Object} event - An object that provides the properties for the event. See https://developer.mozilla.org/en/DOM/event.initEvent
     *                       for some of the properties. These properties are copied to the event object.
     *                       Of particular importance are the cancelable and bubbles properties. The
     *                       cancelable property indicates whether or not the event has a default action
     *                       that can be cancelled. The event is cancelled by calling preventDefault() on
     *                       the event object. The bubbles property indicates whether or not the
     *                       event will bubble up the DOM tree. If bubbles is true, the event will be called
     *                       on the target and then each parent successively until the top of the tree
     *                       is reached or stopPropagation() is called. Both bubbles and cancelable default to false.
     * @return {Boolean} If the event is cancelable and the event is not cancelled, emit will return true. If the event is cancelable and the event is cancelled, emit will return false.
     */
    var syntheticDispatch = emit = function(target, type, event){
      var args = slice.call(arguments, 2);
      var method = 'on' + type;
      if('parentNode' in target){
        // node (or node-like), create event controller methods
        var newEvent = args[0] = {};
        for(var i in event){
          newEvent[i] = event[i];
        }
        newEvent.preventDefault = syntheticPreventDefault;
        newEvent.stopPropagation = syntheticStopPropagation;
        newEvent.target = target;
        newEvent.type = type;
        event = newEvent;
      }
      do{
        // call any node which has a handler (note that ideally we would try/catch to simulate normal event propagation but that causes too much pain for debugging)
        target[method] && target[method].apply(target, args);
        // and then continue up the parent node chain if it is still bubbling (if started as bubbles and stopPropagation hasn't been called)
      }while(event && event.bubbles && (target = target.parentNode));
      return event && event.cancelable && event; // if it is still true (was cancelable and was cancelled), return the event to indicate default action should happen
    };

    if(support['dom-addeventlistener']){
      // emitter that works with native event handling
      emit = function(target, type, event){
        if(target.dispatchEvent && document.createEvent){
          // use the native event emitting mechanism if it is available on the target object
          // create a generic event
          // we could create branch into the different types of event constructors, but
          // that would be a lot of extra code, with little benefit that I can see, seems
          // best to use the generic constructor and copy properties over, making it
          // easy to have events look like the ones created with specific initializers
          var nativeEvent = new CustomEvent(type, event);
          return target.dispatchEvent(nativeEvent) && nativeEvent;
        }
        return syntheticDispatch.apply(emit, arguments); // emit for a non-node
      };
    }

    return emit;

  });

}(
  typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
  // Boilerplate for AMD and Node
));
