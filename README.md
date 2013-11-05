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

