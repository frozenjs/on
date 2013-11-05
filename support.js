(function(global, doc, define){
  'use strict';

  define(function(require){

    var support = {
      'dom': !!doc,
      'touch': !!((doc && 'ontouchstart' in doc) || (global.navigator && global.navigator.msMaxTouchPoints > 0)),
      'mozilla': false, // TODO: implement this
      'dom-addeventlistener': !!(doc && 'addEventListener' in doc),
      'event-orientationchange': !!('ondeviceorientation' in global),
      'event-stopimmediatepropagation': !!(global.Event && global.Event.prototype && global.Event.prototype.stopImmediatePropagation),
      'event-focusin': 'onfocusin' in global // https://github.com/jquery/jquery/blob/bbbdd947256a3fcd788fb9d4f306046082a1ef1f/src/event/support.js
    };

    return support;

  });

}(
  typeof global == 'object' ? global : this.window || this.global,
  typeof document == 'object' && document,
  typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
  // Boilerplate for AMD and Node
));
