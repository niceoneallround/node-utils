/*jslint node: true, vars: true */
var assert = require('assert'),
  testUtils = require('../lib/utils'),
  should = require('should');

describe('Test the test Utils', function () {
  'use strict';

  describe('1 test create dummy service ctx', function () {

    it('1.1 dummy service ctx should be as expected', function (done) {
      testUtils.createDummyServiceCtx({ name: 'testSvc' }, function (ctx) {
        assert(ctx, 'should have passed a ctx');
        ctx.should.have.property('logger');
        ctx.should.have.property('name', 'testSvc');
        done();
      });
    }); //it 1.1
  }); // describe 1

  describe('1 test create test service config', function () {

    it('1.1 dummy service ctx should be as expected', function () {

      var config, props = {};

      config = testUtils.getTestServiceConfig(props);
      assert(config, 'should have returned a config');

      config.should.have.property('crypto');
    }); //it 1.1
  }); // describe 1

}); // describe
