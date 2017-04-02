/*jslint node: true */

//
// Test the logger
//

const should = require('should');
const loggerFactory = require('../lib/logger');

describe('Logger Tests', function () {
  'use strict';

  let props = {};
  props.LOG_ENTRIES = false;

  function logSomeStuff(logger, p1) {
    let md = { test: 'hello' };
    logger.log('info', 'no params', null, md);
    logger.log('info', '1 param %s', [p1], md);
    logger.log('info', '2 param %s, %s', [p1, 'heya2'], md);
  }

  function logSomeJSON(logger, json) {
    let md = { test: 'hello' };
    logger.logJSON('info', json, md);
  }

  it('log progress', function () {
    let logger = loggerFactory.create();
    logger.logProgress('heya');
  });

  it('log some stuff no 3rd party logging', function () {
    logSomeStuff(loggerFactory.create(), 'test1');
  });

  it('log some JSON no 3rd party logging', function () {
    let json = { serviceType: 'UP', error: 'ouch' };
    logSomeJSON(loggerFactory.create(), json);
  });

  it('log some stuff also using log entries', function (done) {
    logSomeStuff(loggerFactory.create(props), 'test2');
    done();
  });

  it('log some JSON also using log entries', function () {
    let json = { serviceType: 'UP', error: 'ouch' };
    logSomeJSON(loggerFactory.create(props), json);
  });

  it('log some JSON with a svcMsg', function () {
    let json = { serviceType: 'UP', action: 'messageOnly', svcMsg: { id: 'nice', type: ['a'] } };
    logSomeJSON(loggerFactory.create(props), json);
  });

  it('log some JSON with a svcMsg and a policy', function () {
    let json = { serviceType: 'UP', action: 'messageAndPolicy', svcMsg: { id: 'nice', type: ['a'] }, policy: { id: 'policy' } };
    logSomeJSON(loggerFactory.create(props), json);
  });

  it('log some JSON with a svcMsg and an error', function () {
    let json = { serviceType: 'UP', action: 'messageAndPolicy', svcMsg: { id: 'nice', type: ['a'] }, error: { id: 'error' } };
    logSomeJSON(loggerFactory.create(props), json);
  });

  it('log some JSON with a svcRequest', function () {
    let json = { serviceType: 'UP', action: 'messageOnly', svcRequest: { id: 'nice', type: ['a'] } };
    logSomeJSON(loggerFactory.create(props), json);
  });

  it('log some JSON with a svcResponse', function () {
    let json = { serviceType: 'UP', action: 'messageOnly', svcResponse: { id: 'nice', type: ['a'] } };
    logSomeJSON(loggerFactory.create(props), json);
  });

  it('log some JSON with a policy', function () {
    let json = { serviceType: 'UP', action: 'policyOnly', policy: { id: 'nice', type: ['a'] } };
    logSomeJSON(loggerFactory.create(props), json);
  });

  it('log some JSON with metadata', function () {
    let json = { serviceType: 'UP', action: 'metadataOnly', metadata: { id: 'nice', type: ['a'], obj: [{ a: 1 }] } };
    logSomeJSON(loggerFactory.create(props), json);
  });

  it('log some JSON with data', function () {
    let json = { serviceType: 'UP', action: 'dataOnly', data: { id: 'nice', type: ['a'] } };
    logSomeJSON(loggerFactory.create(props), json);
  });

  it('log error message', function () {
    let json = { serviceType: 'UP', action: 'errorOnly', error: { id: 'nice', type: ['a'] } };
    logSomeJSON(loggerFactory.create(props), json);
  });

});
