/*jslint node: true, indent: 2, passfail: true */
/*globals describe, it */

"use strict";

var expect = require('expect.js'),
  defer = require('../defer/defer.js');


describe('The Defer library', function () {

  it('loads in the current environment', function () {

    expect(defer).to.be.ok();

  });

  it('exposes a specification compliant interface', function () {

    expect(typeof defer).to.be("function");
    expect(typeof defer.bind).to.be("function");

  });

  it('triggers async execution of functions', function (done) {

    var test_object = {};

    expect(test_object.test).to.be(undefined);

    defer(function () {
      test_object.test = true;

      expect(test_object.test).to.be(true);

      done();
    });

    expect(test_object.test).to.be(undefined);

  });

  it('provides a bind implementation', function () {

    var specialContext = {},
      boundCheckArgs;

    function checkArgs() {

      var args = Array.prototype.slice.call(arguments);
      expect(this).to.be(specialContext);
      expect(args.length).to.be(3);
      expect(args[0]).to.be(true);
      expect(args[1]).to.be(false);
      expect(args[2]).to.be('test');

    }

    boundCheckArgs = defer.bind(checkArgs, specialContext, true, false);
    boundCheckArgs('test');

  });

});
