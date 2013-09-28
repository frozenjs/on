(function(define){
  'use strict';

  define(function(require){

    var on = require('./on');
    var emit = require('./emit');
    var meld = require('meld');

    function noop(){}

    function Evented(){
      // summary:
      //    A class that can be used as a mixin or base class,
      //    to add on() and emit() methods to a class
      //    for listening for events and emitting events:
      //
      //    | define(["dojo/Evented"], function(Evented){
      //    |   var EventedWidget = dojo.declare([Evented, dijit._Widget], {...});
      //    |   widget = new EventedWidget();
      //    |   widget.on("open", function(event){
      //    |   ... do something with event
      //    |  });
      //    |
      //    | widget.emit("open", {name:"some event", ...});
    }
    Evented.prototype = {
      on: function(type, listener){
        return on.parse(this, type, listener, function(target, type){
          // meld requires the method to exist on the object
          var method = 'on' + type;
          if(!(method in target)){
            target[method] = noop;
          }
          return meld.on(target, 'on' + type, listener);
        });
      },
      emit: function(type, event){
        var args = [this];
        args.push.apply(args, arguments);
        return emit.apply(on, args);
      }
    };
    return Evented;
  });

}(
  typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
  // Boilerplate for AMD and Node
));
