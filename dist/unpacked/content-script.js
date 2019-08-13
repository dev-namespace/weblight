/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/content/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/deferjs/defer/defer.js":
/*!*********************************************!*\
  !*** ./node_modules/deferjs/defer/defer.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(setImmediate, process) {/*
The MIT License (MIT)
Copyright (c) 2013 Kevin Conway

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*jslint node: true, browser: true, indent: 2, passfail: true */

module.exports = (function (context) {
  "use strict";

  var defer;

  function getSetImmediate() {
    try {
      return setImmediate;
    } catch (err) {
      return false;
    }
  }

  function getNextTick() {
    try {
      return process.nextTick;
    } catch (err) {
      return false;
    }
  }

  // window.postMessage is refered to quite a bit in articles
  // discussing a potential setZeroTimeout for browsers. The
  // problem it attempts to solve is that setTimeout has a
  // minimum wait time in all browsers. This means your function
  // is not scheduled to run on the next cycle of the event loop
  // but, rather, at the next cycle of the event loop after the
  // timeout has passed.
  //
  // Instead, this method uses a message passing features that
  // has been integrated into modern browsers to replicate the
  // functionality of process.nextTick.
  function postMessage(ctx) {
    var queue = [],
      message = "nextTick";

    function handle(event) {

      if (event.source === ctx && event.data === message) {

        if (!!event.stopPropogation) {

          event.stopPropogation();

        }

        if (queue.length > 0) {

          queue.shift()();

        }

      }

    }

    if (!!ctx.addEventListener) {

      ctx.addEventListener("message", handle, true);

    } else {

      ctx.attachEvent("onmessage", handle);

    }

    return function defer(fn) {

      queue.push(fn);
      ctx.postMessage(message, '*');

    };
  }

  function sillyDefer(fn) {
    setTimeout(fn, 0);
  }

  defer = defer || getSetImmediate() || undefined;
  defer = defer || getNextTick() || undefined;
  defer = defer || (context.window && postMessage(context.window)) || undefined;
  defer = defer || sillyDefer;

  defer.defer = defer;

  function arrayFromArguments() {
    var args = [],
      length = arguments.length,
      x;

    for (x = 0; x < length; x = x + 1) {
      args[x] = arguments[x];
    }

    return args;
  }

  function bindShim(fn, ctx) {
    var boundArgs = arrayFromArguments.apply(undefined, arguments);

    if (!!Function.prototype.bind) {
      return Function.prototype.bind.apply(fn, boundArgs.slice(1));
    }

    return function bindShimWrapper() {
      var unboundArgs = arrayFromArguments.apply(undefined, arguments);
      return fn.apply(ctx, boundArgs.concat(unboundArgs));
    };
  }

  defer.bind = bindShim;

  return defer;
}(this));

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../timers-browserify/main.js */ "./node_modules/timers-browserify/main.js").setImmediate, __webpack_require__(/*! ./../../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/eventjs/event/event.js":
/*!*********************************************!*\
  !*** ./node_modules/eventjs/event/event.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
The MIT License (MIT)
Copyright (c) 2013 Kevin Conway

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*jslint node: true, continue: true, indent: 2, passfail: true */


module.exports = (function () {

  var Modelo = __webpack_require__(/*! modelo */ "./node_modules/modelo/modelo/modelo.js"),
    defer = __webpack_require__(/*! deferjs */ "./node_modules/deferjs/defer/defer.js"),
    EventMixin;

  // Adds a listener to the list.
  // Private method hidden from api.
  function appendListener(event, listener, once) {

    this.events[event] = this.events[event] || [];
    this.events[event].push({
      "listener": listener,
      "once": !!once
    });

    this.emit('newListener', event, listener);

    if (this.events[event].length > this.maxListeners) {

      console.warn('warning: possible EventEmitter memory leak detected. ',
        this.events[event].length, ' listeners added. ',
        'Use emitter.setMaxListeners() to increase limit. ',
        this);

    }

  }

  function popListeners(event, listener) {

    var x, removed;

    this.events[event] = this.events[event] || [];

    for (x = this.events[event].length - 1; x >= 0; x = x - 1) {

      if (listener !== undefined &&
          this.events[event][x].listener !== listener) {

        continue;

      }

      removed = this.events[event].splice(x, 1);
      this.emit('removeListener', event, removed);

    }

  }

  // The EventMixin object is a Modelo object that provides asynchronous
  // events. While new instances of EventMixin can be created directly, it
  // is intended as more of a Mix-In object that can be added to any
  // inheritance chain.
  EventMixin = Modelo.define(function EventMixin() {

    this.events = {};
    this.maxListeners = 10;

  });

  // Adds a listener to the end of the listeners array for the specified event.
  // Returns emitter, so calls can be chained.
  EventMixin.prototype.addListener = function addListener(event, listener) {

    appendListener.call(this, event, listener, false);
    return this;

  };
  EventMixin.prototype.on = EventMixin.prototype.addListener;

  EventMixin.prototype.once = function once(event, listener) {

    appendListener.call(this, event, listener, true);

    return this;

  };

  // Remove a listener from the listener array for the specified event.
  // Returns emitter, so calls can be chained.
  EventMixin.prototype.removeListener = function removeListener(
    event,
    listener
  ) {

    // Insert empty object for listener when not given to prevent accidental
    // removal of all listeners.
    popListeners.call(this, event, listener || {});

    return this;

  };

  // Removes all listeners, or those of the specified event. It's not a good
  // idea to remove listeners that were added elsewhere in the code, especially
  // when it's on an emitter that you didn't create.
  // Returns emitter, so calls can be chained.
  EventMixin.prototype.removeAllListeners = function removeAllListeners(
    event
  ) {

    var keys,
      length,
      x;

    if (event === undefined) {

      keys = Object.keys(this.events);
      length = keys.length;
      for (x = 0; x < length; x = x + 1) {
        popListeners.call(this, keys[x]);
      }

    } else {

      popListeners.call(this, event);

    }

    return this;

  };

  // By default EventEmitters will print a warning if more than 10 listeners
  // are added for a particular event. This is a useful default which helps
  // finding memory leaks. Obviously not all Emitters should be limited to 10.
  // This function allows that to be increased. Set to zero for unlimited.
  EventMixin.prototype.setMaxListeners = function setMaxListeners(n) {

    this.maxListeners = n;

  };

  // Returns an array of listeners for the specified event.
  EventMixin.prototype.listeners = function listeners(event) {

    var results = [],
      x;

    this.events[event] = this.events[event] || [];

    for (x = 0; x < this.events[event].length; x = x + 1) {

      results.push(this.events[event][x].listener);

    }

    return results;

  };

  // Execute each of the listeners in order with the supplied arguments.
  // Returns true if event had listeners, false otherwise.
  EventMixin.prototype.emit = function emit(event) {

    var listenerArgs = [],
      length = arguments.length,
      x,
      numberListeners,
      remove = [];

    for (x = 1; x < length; x = x + 1) {
      listenerArgs[x - 1] = arguments[x];
    }

    this.events[event] = this.events[event] || [];
    numberListeners = this.events[event].length;

    function executeListener(listener, args) {

      listener.apply(this, args);

    }

    length = this.events[event].length;
    for (x = 0; x < length; x = x + 1) {

      defer(
        defer.bind(
          executeListener,
          this,
          this.events[event][x].listener,
          listenerArgs
        )
      );

      if (this.events[event][x].once === true) {

        remove.push(this.events[event][x].listener);

      }

    }

    length = remove.length;
    for (x = 0; x < length; x = x + 1) {

      this.removeListener(event, remove[x]);

    }

    return numberListeners > 0;

  };

  // Return the number of listeners for a given event.
  EventMixin.listenerCount = function listenerCount(emitter, event) {

    return emitter.listeners(event).length;

  };

  return EventMixin;

}());


/***/ }),

/***/ "./node_modules/modelo/modelo/modelo.js":
/*!**********************************************!*\
  !*** ./node_modules/modelo/modelo/modelo.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
The MIT License (MIT)
Copyright (c) 2012 Kevin Conway

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*jslint node: true, indent: 2, passfail: true, nomen: true */
/*global define */


function arrayFromArguments() {
  var length = arguments.length,
    args = [],
    x;

  for (x = 0; x < length; x = x + 1) {
    args[x] = arguments[x];
  }

  return args;
}

function copyPrototype(take, give) {
  var keys = Object.keys(give.prototype),
    length = keys.length,
    x;

  for (x = 0; x < length; x = x + 1) {
    take.prototype[keys[x]] = give.prototype[keys[x]];
  }
}

function ModeloBase() {
  return this;
}

function isInstance(self, bases, base) {

  var length = bases.length,
    x;

  if (base === self) {
    return true;
  }

  for (x = 0; x < length; x = x + 1) {
    if (base === bases[x]) {
      return true;
    }

    if (!!bases[x].prototype.isInstance &&
          bases[x].prototype.isInstance(base)) {
      return true;
    }
  }

  return false;

}

function extend() {
  return define.apply(undefined, arguments);
}

function define() {

  var constructors = arrayFromArguments.apply(undefined, arguments),
    length = constructors.length,
    x;

  function ModeloWrapper() {

    var y;

    for (y = 0; y < length; y = y + 1) {
      if (arguments.length > 0) {
        constructors[y].apply(this, arguments);
      } else {
        constructors[y].call(this, {});
      }
    }

  }

  for (x = 0; x < length; x = x + 1) {
    copyPrototype(ModeloWrapper, constructors[x]);
  }
  if (length > 0) {
    ModeloWrapper.constructor = constructors[length - 1].constructor;
  }

  ModeloWrapper.prototype.isInstance = isInstance.bind(
    undefined,
    ModeloWrapper,
    constructors
  );
  ModeloWrapper.extend = extend.bind(undefined, ModeloWrapper);

  return ModeloWrapper;

}

function inherits(child, parent) {

  var constructors = [parent],
    length,
    x;

  // This method brought to you by Node.js util module.
  // https://github.com/joyent/node/blob/master/lib/util.js
  child.super_ = parent;
  child.prototype = Object.create(
    parent.prototype,
    {
      constructor: {
        value: child,
        enumerable: false,
        writable: true,
        configurable: true
      }
    }
  );

  if (arguments.length > 2) {

    constructors = arrayFromArguments.apply(undefined, arguments);
    constructors.shift();
    length = constructors.length;

    for (x = 1; x < length; x = x + 1) {
      copyPrototype(child, constructors[x]);
    }

  }

  child.prototype.isInstance = isInstance.bind(
    undefined,
    child,
    constructors
  );
  child.extend = extend.bind(undefined, child);

  return child;

}

define.define = define;
define.inherits = inherits;

module.exports = define;


/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/setimmediate/setImmediate.js":
/*!***************************************************!*\
  !*** ./node_modules/setimmediate/setImmediate.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js"), __webpack_require__(/*! ./../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/timers-browserify/main.js":
/*!************************************************!*\
  !*** ./node_modules/timers-browserify/main.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var scope = (typeof global !== "undefined" && global) ||
            (typeof self !== "undefined" && self) ||
            window;
var apply = Function.prototype.apply;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, scope, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, scope, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(scope, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object
__webpack_require__(/*! setimmediate */ "./node_modules/setimmediate/setImmediate.js");
// On some exotic environments, it's not clear which object `setimmediate` was
// able to install onto.  Search each possibility in the same order as the
// `setimmediate` library.
exports.setImmediate = (typeof self !== "undefined" && self.setImmediate) ||
                       (typeof global !== "undefined" && global.setImmediate) ||
                       (this && this.setImmediate);
exports.clearImmediate = (typeof self !== "undefined" && self.clearImmediate) ||
                         (typeof global !== "undefined" && global.clearImmediate) ||
                         (this && this.clearImmediate);

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./src/content/commands.js":
/*!*********************************!*\
  !*** ./src/content/commands.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function Commands(){
    const registerCallback = (cid, callback) => commandCallbacks[cid] = callback
    const commandCallbacks = {}
    const commands = {
        renderResults: results => {
            EV.emit('renderResults', results)
        },
        printResults: results => {
            console.log(results)
        }
    }

    function build(){
        chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => { //@TODO move this to onLoaded
            if(msg.type === 'command') commands[msg.command](...msg.args)
            else if(msg.type === 'callback'){
                commandCallbacks[msg.cid](...msg.args)
                delete commandCallbacks[msg.cid]
            }
        })

        EV.on('command', (...args) => commandMsg(...args))
    }

    function commandMsg (command, args, callback) {
        console.log('command:', command, args)
        const cid = callback ? Math.random().toString(36) : undefined
        if(callback) registerCallback(cid, callback)
        chrome.runtime.sendMessage({type: 'command', command, args, cid})
    }

    function remove(){
        EV.off('command')
    }

    build()
    return { build }
}

/* harmony default export */ __webpack_exports__["default"] = (Commands);




/***/ }),

/***/ "./src/content/index.js":
/*!******************************!*\
  !*** ./src/content/index.js ***!
  \******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var eventjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! eventjs */ "./node_modules/eventjs/event/event.js");
/* harmony import */ var eventjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(eventjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _main__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./main */ "./src/content/main.js");


window.EV = new eventjs__WEBPACK_IMPORTED_MODULE_0___default.a('test', 'renderResults')

Object(_main__WEBPACK_IMPORTED_MODULE_1__["main"])()



/***/ }),

/***/ "./src/content/main.js":
/*!*****************************!*\
  !*** ./src/content/main.js ***!
  \*****************************/
/*! exports provided: main */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "main", function() { return main; });
/* harmony import */ var _modal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modal */ "./src/content/modal.js");
/* harmony import */ var _commands__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./commands */ "./src/content/commands.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils.js");
//@TODO: separate into highlights.js
// -------------------------
// import files




// -------------------------
// confirm

const px = n => `${n}px`

const div = (html = '', children = [], style) => {
    const d = document.createElement('div')
    d.className = '--highlight--'
    d.innerHTML = html
    if (children) children.forEach(ch => d.appendChild(ch))
    Object.assign(d.style, style)
    return d
}

const button = (label, fn) => {
    const button = document.createElement('button')
    button.innerText = label
    button.addEventListener('click', fn)
    Object.assign(button.style, {
        background: 'white', color: '#111', padding: '5px 10px',
        border: '2px solid black', margin: px(2)
    })
    return button
}

const remove = (e) => e.parentNode.removeChild(e)

function confirm(msg, { clientX, clientY }) {
    const x = window.scrollX + clientX
    const y = window.scrollY + clientY
    return new Promise((resolve) => {
        const keyPress = e => {
            if(e.key === 'w') close(true)
            else if(e.key === 'Escape' || e.key === "Esc") close(false)
        }
        const mouseDown = e => {
            if(![...e.path].includes(document.querySelector('.--highlight--modal'))) close(false)
        }
        const close = resolution => {
            document.removeEventListener('mousedown', mouseDown)
            document.removeEventListener('keydown', keyPress)
            remove(d)
            resolve(resolution)
        }
        const d = div(
            `<strong>${msg}</strong><br/>`, [
                button('Cancel', () => close(false)),
                button('OK', () => close(true))
            ], {
                background: '#fefefe', padding: px(20), position: 'absolute',
                border: '2px solid black', top: px(y), left: px(x), zIndex: '99999',
                display: 'none'
            }
        )
        document.addEventListener('mousedown', mouseDown)
        document.addEventListener('keydown', keyPress)
        d.classList.add('--highlight--modal')
        document.body.appendChild(d)
    })
}

// -------------------------
// DOM queries

function serializeNode(node) {
    if (node.nodeType === 1) return { type: 1, path: Object(_utils__WEBPACK_IMPORTED_MODULE_2__["getPathToElement"])(node) }
    if (node.nodeType !== 3) throw new Exception('Unknown node type')
    const parent = node.parentNode
    const index = Array.from(parent.childNodes).indexOf(node)
    const path = Object(_utils__WEBPACK_IMPORTED_MODULE_2__["getPathToElement"])(parent)
    return { type: 3, index, path }
}

function serializeRange(range) {
    const { startOffset, endOffset } = range
    const startNode = serializeNode(range.startContainer)
    const endNode = serializeNode(range.endContainer)
    return { startNode, startOffset, endNode, endOffset }
}

function rebuildNode(nodeDescription) {
    const { type, index, path } = nodeDescription
    const node = Object(_utils__WEBPACK_IMPORTED_MODULE_2__["lookupElementByPath"])(path)
    if (type === 1) return node
    else return node.childNodes[index]
}

function rebuildRange(rangeDescription) {
    const { startNode, startOffset, endNode, endOffset } = rangeDescription
    const startContainer = rebuildNode(startNode)
    const endContainer = rebuildNode(endNode)
    const range = new Range()
    range.setStart(startContainer, startOffset)
    range.setEnd(endContainer, endOffset)
    return range
}

// -------------------------
// commands

function isRectContained(r1, r2) {
    return (
        (r1.x <= r2.x && r1.x + r1.width >= r2.x + r2.width) &&
            (r1.y <= r2.y && r1.y + r1.height >= r2.y + r2.height)
    )

}

function highlightRect({ x, y, width, height }, offset, handler) {
    const padding = 4
    const offsetX = offset.x - padding / 2
    const offsetY = offset.y - padding / 2
    const d = div('', null, {
        left: px(offsetX + x), top: px(offsetY + y), zIndex: '99999',
        width: px(width), height: px(height), background: 'rgb(244, 241, 66, 0.2)',
        position: 'absolute', padding: `${padding}px 0`
    })
    d.addEventListener('click', handler)
    document.body.appendChild(d)
    return d
}

function displayHighlight({ id, range: rangeDescriptor }) {
    let nodes
    const range = rebuildRange(rangeDescriptor)
    const rects = Array.from(range.getClientRects())
    const purgedRects = rects.reduce((acc, r1, i) => {
        if (acc.some(r2 => isRectContained(r2, r1)) ||
            rects.slice(i + 1).some(r2 => isRectContained(r2, r1)))
            return acc
        else
            return [...acc, r1]
    }, [])
    const offset = { x: window.scrollX, y: window.scrollY }
    const removeHandler = async (e) => {
        if (await confirm('Remove?', e)) {
            removeHighlight(id)
            nodes.forEach(remove)
        }
    }
    nodes = purgedRects.map(r => highlightRect(r, offset, removeHandler))
}

function createHighlight(selectionRange, selectionString) {
    const range = serializeRange(selectionRange)
    const text = selectionString
    const id = Math.random().toString(36)
    const highlight = { id, range, text }
    return highlight
}

// -------------------------
// persistence

const localStorageKey = 'highlights'
const url = window.location.href

function retrieveHighlights() {
    const site = JSON.parse(localStorage.getItem(localStorageKey) || '{}')
    return (site[url] || [])
}

function storeHighlights(highlights) {
    const site = JSON.parse(localStorage.getItem(localStorageKey) || '{}')
    site[url] = highlights
    localStorage.setItem(localStorageKey, JSON.stringify(site))
}

function removeHighlight(targetId) {
    const stored = retrieveHighlights()
    const purged = stored.filter(({ id }) => id !== targetId)
    storeHighlights(purged)
    EV.emit('command', 'removeHighlight', [{id: targetId}])
}

function persistHighlight({ id, range, text }) {
    const serializableHighlight = { id, range, text}
    const stored = retrieveHighlights()
    storeHighlights([...stored, serializableHighlight])
}

async function restoreHighlights() {
    let highlights = retrieveHighlights()
    if(true){ //@TODO: if database connection or whatever
        const serverHighlights = await fetchHighlights()
        highlights = Object(_utils__WEBPACK_IMPORTED_MODULE_2__["uniqBy"])([...highlights, ...serverHighlights], 'id')
    }
    highlights.forEach((highlight) => {
        try { displayHighlight(highlight) }
        catch (e) { console.error(e) }
    })
}


// -------------------------
// back-end

function sendHighlight({id, range, text}){ //@TODO: mix with persistance
    //@TODO: we don't want to send page text every highlight, check if exists in local storage?
    const page = {url, text: document.body.textContent, title: document.title}
    const highlight = {id, range, text, url, indexable: true}
    EV.emit('command', 'sendHighlight', [{highlight, page}])
}

function fetchHighlights(){
    return new Promise((resolve) => {
        EV.emit('command', 'queryHighlights', [{url}], results => {
            resolve(results.highlights)
        })
    })
}

// -------------------------
// entry point

function main(){
    Object(_commands__WEBPACK_IMPORTED_MODULE_1__["default"])()
    Object(_modal__WEBPACK_IMPORTED_MODULE_0__["default"])()

    document.addEventListener('mouseup', async function handler(e) {
        const selection = window.getSelection()
        const range = selection.getRangeAt(0)
        const text = selection.toString()
        if (selection.isCollapsed) return
        document.removeEventListener('mouseup', handler)
        if (await confirm('Highlight?', e)) {
            let highlight = createHighlight(range, text)
            //@TODO: check send, then display and persist
            displayHighlight(highlight)
            persistHighlight(highlight)
            sendHighlight(highlight)
            selection.empty()
        }
        setTimeout(
            () => document.addEventListener('mouseup', handler),
            100
        )
    })

    window.addEventListener('load', () => setTimeout(restoreHighlights, 100))

    window.addEventListener('resize', Object(_utils__WEBPACK_IMPORTED_MODULE_2__["debounce"])(10, () => {
        const boxes = document.querySelectorAll('.--highlight--')
        Array.from(boxes).forEach(remove)
        restoreHighlights()
    }))
}



/***/ }),

/***/ "./src/content/modal.js":
/*!******************************!*\
  !*** ./src/content/modal.js ***!
  \******************************/
/*! exports provided: Modal, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Modal", function() { return Modal; });
/* harmony import */ var _commands__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./commands */ "./src/content/commands.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/utils.js");



function Modal(){
    let modal, viewContainer, userContainer
    let view, loggedUser

    function build(){

        modal = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["addNode"])('div', ['wl-modal--container', 'hidden'], document.body)
        userContainer = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["addNode"])('div', ['wl-modal--user'], modal)
        viewContainer = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["addNode"])('div', ['wl-modal--view'], modal)
        userContainer.innerHTML = 'unlogged'
        userContainer.onclick = ev => EV.emit('apply-logout')
        document.addEventListener('keydown', e => {
            if(e.key === 'o' && e.altKey){
                if(!view) {
                    if(!loggedUser) renderView(LoginView)
                    else renderView(SearchView)
                }
                toggleModal()
            }
        })

        EV.on('apply-logout', data => {
            EV.emit('command', 'logOut', [{}], response => {
                if(!response.user) EV.emit('register-logout', response)
            })
        })

        EV.on('register-login', data => {
            loggedUser = data.user
            userContainer.innerHTML = `user: ${data.user}`
            renderView(SearchView)
        })

        EV.on('register-logout', data => {
            console.log('logged out')
            loggedUser = undefined
            userContainer.innerHTML = `unlogged`
            renderView(LoginView)
        })

        EV.emit('command', 'isLogged', [{}], response => {
            console.log('isLogged: ', response)
            if(response) EV.emit('register-login', {user: response})
        })
    }

    function toggleModal(){
        modal.classList.toggle('hidden')
        if(!modal.classList.contains('hidden')){
            view && view.focus()
        }
    }

    function renderView(View){
        view && view.remove()
        view = View(viewContainer)
        view.render()
        view.focus()
    }

    build()
    return { build }
}

function LoginView(container){
    let user, pass, view
    function render(){
        view = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["addNode"])('div', ['wl-modal--view'], container)
        user = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["addNode"])('input', ['wl-modal--login--user'], view)
        pass = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["addNode"])('input', ['wl-modal--login--pass'], view)
        user.onkeyup = ev => {
            if(ev.keyCode === 13){
                EV.emit('command', 'logIn', [{user: user.value, pass: pass.value}], response => {
                    if(response.user) EV.emit('register-login', response)
                })
            }
        }
    }

    function focus(){
        user.focus()
    }

    function remove(){
        container.innerHTML = ''
    }

    return {render, focus, remove}
}

function SearchView(container){
    let search, results, view
    function render(){
        view = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["addNode"])('div', ['wl-modal--view'], container)
        search = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["addNode"])('input', ['wl-modal--search'], view)
        results = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["addNode"])('div', ['wl-modal--results'], view)
        search.onkeyup = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["debounce"])(100, e => {
            if(search.value.length > 3) {
                EV.emit('command', 'searchHighlights', [{search: search.value}], renderResults)
            }
        })
    }

    function focus(){
        search.focus()
    }

    function remove(){
        // EV.off('renderResults', renderResults) //@TODO
        view.remove()
    }

    function renderResults(res){
        console.log('rendering results:', res)
        results.innerHTML = ''
        res.results.sort((a, b) => b.score - a.score)
        res.results.forEach(result => {
            console.log('result', result)
            const page = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["addNode"])('div', ['wl-modal--page'], results)
            const pageHeader = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["addNode"])('div', ['wl-modal--page--header'], page)
            const iconContainer = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["addNode"])('div', ['wl-modal--result--icon'], pageHeader)
            const icon = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["addNode"])('img', [], iconContainer)
            icon.src = `https://plus.google.com/_/favicon?domain_url=${result._id}`
            const resultText = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["addNode"])('span', ['wl-modal--page--header--text'], pageHeader, result.title.slice(0, 45))
            const link = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["addNode"])('a', [], pageHeader)
            const highlightContainer = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["addNode"])('div', [], page)
            page.onclick = () => toggleHighlights(highlightContainer, result)
        })
    }

    function renderHighlights(page, result){
        result.highlights.forEach(highlight => {
            console.log('hl', highlight)
            const link = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["addNode"])('a', [], page)
            const hl = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["addNode"])('div', ['wl-modal--result'], link)
            // const iconContainer = addNode('div', ['wl-modal--result--icon'], hl)
            const resultText = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["addNode"])('span', ['wl-modal--result--text'], hl, highlight.text)
            // const icon = addNode('img', [], iconContainer)
            // icon.src = `https://plus.google.com/_/favicon?domain_url=${highlight.url}`
            link.href = highlight.url
        })
    }

    function toggleHighlights(page, result){
        if(result.visible) {
            page.innerHTML = ''
            result.visible = false
            return
        }
        renderHighlights(page, result)
        result.visible = true
    }


    return {render, focus, remove}
}

/* harmony default export */ __webpack_exports__["default"] = (Modal);


/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/*! exports provided: debounce, addNode, getPathToElement, lookupElementByPath, uniqBy */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "debounce", function() { return debounce; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addNode", function() { return addNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPathToElement", function() { return getPathToElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lookupElementByPath", function() { return lookupElementByPath; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "uniqBy", function() { return uniqBy; });
const debounce = (ms, fn) => {
    let id
    return (...args) => {
        clearTimeout(id)
        id = setTimeout(() => fn(...args), ms)
    }
}

const addNode = (tag, classes, parent, innerHTML = '') => {
    const node = document.createElement(tag)
    node.classList.add(...classes)
    node.innerHTML = innerHTML
    if(parent) parent.appendChild(node)
    return node
}

function getPathToElement(el) {
    if (el.id) return `[id="${el.id}"]`
    if (el.tagName.toLowerCase() === 'body') return el.tagName
    const idx = Array.from(el.parentNode.children).indexOf(el) + 1
    return `${getPathToElement(el.parentNode)} > ${el.tagName}:nth-child(${idx})`
}

function lookupElementByPath(path) {
    return document.querySelector(path)
}

const uniqBy = (arr, predicate) => {
    const cb = typeof predicate === 'function' ? predicate : (o) => o[predicate]
    return [...arr.reduce((map, item) => {
        const key = (item === null || item === undefined) ? item : cb(item)
        map.has(key) || map.set(key, item)
        return map
    }, new Map()).values()]
}


/***/ })

/******/ });
//# sourceMappingURL=content-script.js.map