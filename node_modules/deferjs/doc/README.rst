======================
Defer.js Documentation
======================

.. contents::

Description
===========

The defer.js library provides a platform independent process for scheduling
functions to execute at a later cycle of the event loop. In Node.js this
functionality is provided by setImmediate when available and process.nextTick
when setImmediate is not present.

In browser environments, this library leverages window.postMessage to schedule
events. If the current browser environment does not support window.postMessage
the library falls back to setTimeout.

Usage Examples
==============

The defer.js library interface is identical to that the Node.js
process.nextTick. Simply pass in the function to defer::

    function logLater() {

        console.log("Second");

    }

    defer(logLater);
    console.log("First");

    // Console Output: "First"
    // Console Output: "Second"

Deferring function with arguments
---------------------------------

Just as in the Node.js environment, there is no direct way to pass arguments
to the deferred function. Instead, function wrappers or binding should be used
to provide this functionality. There is a method called `bind` in this module
which has similar interface to the built-in method of the same name.::

    function log(value) {

        console.log(value);

    }

    defer(defer.bind(log, null, "Second"));
    log("First");

    // Console Output: "First"
    // Console Output: "Second"

API Reference
=============

Exports
-------

When required in a Node.js the `defer` function is exported. For convenience,
a `bind` method is attached to this function::

    var defer = require('deferjs');

    typeof defer === "function"; // true
    typeof defer.bind === "function"; // true

In browser environments the `defer` function is injected into the global
`deferjs` variable::

    typeof deferjs === "function"; // true
    typeof deferjs.defer === "function"; // true
    typeof deferjs.bind === "function"; // true

defer(fn)
---------

Calls to `defer` will delay the execution of a function until the next
available cycle of the event loop.

bind(fn, ctx[, arg1[, arg2...]])
--------------------------------

Create a bound form of `fn` which executes within the context of `ctx`.
Optionally, bind `fn` to run with a given set of arguments as preceding the
arguments passed to the bound version of the function. This behaviour should
be comparable to the built in `Function.prototype.bind` method.
