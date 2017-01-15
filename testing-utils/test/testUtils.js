/*jslint node: true, vars: true */
const assert = require('assert');
const testUtils = require('../lib/utils');
const should = require('should');

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

    it('1.2 dummy service ctx NO CALLBACK', function () {
      let ctx = testUtils.createDummyServiceCtx({ name: 'testSvc' });
      assert(ctx, 'should have passed a ctx');
      ctx.should.have.property('logger');
      ctx.should.have.property('name', 'testSvc');
    }); //it 1.2
  }); // describe 1

  describe('2 test create test service config', function () {

    it('2.1 dummy service ctx should be as expected', function () {

      let config = testUtils.getTestServiceConfig({});
      assert(config, 'should have returned a config');

      config.should.have.property('crypto');
    }); //it 2.1
  }); // describe 2

  describe('3 test create dummy response object', function () {

    it('3.1 dummy response object should be as expected', function () {

      let rsp = testUtils.createDummyResponseObject();
      assert(rsp, 'should have returned a rsp');
      rsp.should.have.property('headers');
      rsp.setHeader('foo', 'bar');
      rsp.headers.should.have.property('foo', 'bar');
      rsp.setHeader('content-type', 'text/plain');
      rsp.headers.should.have.property('content-type', 'text/plain');
    }); //it 3.1

    it('3.2 dummy request object should be as expected', function () {

      let req = testUtils.createDummyRequestObject();
      assert(req, 'should have returned a rsp');
      req.should.have.property('headers');
      req.setHeader('foo', 'bar');
      req.headers.should.have.property('foo', 'bar');
    }); //it 3.2
  }); // describe 3

}); // describe
