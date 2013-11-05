# On

Simple event handling functions. Based on `dojo/on`.

## Usage

### `on`

The `on` module is used to listen for events.

```js
define(function(require){
  var on = require('frozen-on');

  var button = document.createElement('button');

  on(button, 'click', function(e){
    // do something with event
  });
});
```

Calling `on` returns an object containing a `remove` method, which removes the event handler.

```js
define(function(require){
  var on = require('frozen-on');

  var button = document.createElement('button');

  var remover = on(button, 'click', function(e){
    // do something with event
    remover.remove();
  });
});
```

It can use extension events, also.

```js
define(function(require){
  var on = require('frozen-on');
  var tap = require('dojo/gesture/tap');

  var button = document.createElement('button');

  on(button, tap, function(e){
    // do something with event
  });
});
```

### `on.once`

`on.once` provides a way to listen to an event one time (automatically removes the handler after first call).

```js
define(function(require){
  var on = require('frozen-on');

  var button = document.createElement('button');

  on.once(button, 'click', function(e){
    // do something with event
  });
});
```

### `on.pausable`

`on.pausable` behaves as a normal `on` call, but the returned object has `pause` and `resume` methods, too.

Calling `pause` stops the event handler callback from being called, while calling `resume` starts it again.

```js
define(function(require){
  var on = require('frozen-on');

  var button = document.createElement('button');

  var pauser = on.pausable(button, 'click', function(e){
    // do something with event
    pauser.pause();
    setTimeout(function(){
      pauser.resume();
    }, 1500);
  });
});
```

### `emit`

The `emit` module is used for publishing events.

```js
define(function(require){
  var emit = require('frozen-on/emit');

  var button = document.createElement('button');

  emit(button, 'click', {
    cancelable: true,
    bubbles: true,
    screenX: 33,
    screenY: 44
  });
});
```

### Evented

A Class that exposes `on` and `emit` methods on the object.

```js
var Evented = require('frozen-on/Evented');

var obj = new Evented();

obj.on('open', function(e){
  // do something with event
});

obj.emit('open', {name: 'foo'});
```

