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
