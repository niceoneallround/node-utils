/*jslint node: true, vars: true */

//
// Test the logger
//

var should = require('should'),

    //util = require('util'),
    loggerFactory = require('../lib/logger'),
    LOG_P = loggerFactory.PROPERTIES;

describe('Logger Tests', function() {
  'use strict';

  function logSomeStuff(logger, p1) {
    var md = {test: 'hello'};
    logger.log('info', 'no params', null, md);
    logger.log('info', '1 param %s', [p1], md);
    logger.log('info', '2 param %s, %s', [p1, 'heya2'], md);
  }

  function logSomeJSON(logger, json) {
    var md = {test: 'hello'};
    logger.logJSON('info', json, md);
  }

  it('log some stuff no 3rd party logging', function() {
    logSomeStuff(loggerFactory.create(), 'test1');
  });

  it('log some JSON no 3rd party logging', function() {
    var json = {serviceType: 'UP', error:'ouch'};
    logSomeJSON(loggerFactory.create(), json);
  });

  it('log some stuff also using log entries', function(done) {
    var cfg = {};
    cfg[LOG_P.useLogEntries] = 'true';
    logSomeStuff(loggerFactory.create(cfg), 'test2');
    done();
  });

  it('log some JSON also using log entries', function() {
    var json = {serviceType: 'UP', error:'ouch'},
        cfg = {};
    cfg[LOG_P.useLogEntries] = 'true';
    logSomeJSON(loggerFactory.create(cfg), json);
  });

  it('log some JSON with a svcMsg', function() {
    var json = {serviceType: 'UP', action: 'messageOnly', svcMsg: {id: 'nice', type: ['a']}},
        cfg = {};
    cfg[LOG_P.useLogEntries] = 'true';
    logSomeJSON(loggerFactory.create(cfg), json);
  });

  it('log some JSON with a svcMsg and a policy', function() {
    var json = {serviceType: 'UP', action: 'messageAndPolicy', svcMsg: {id: 'nice', type: ['a']}, policy: {id: 'policy'}},
        cfg = {};
    cfg[LOG_P.useLogEntries] = 'true';
    logSomeJSON(loggerFactory.create(cfg), json);
  });

  it('log some JSON with a svcMsg and an error', function() {
    var json = {serviceType: 'UP', action: 'messageAndPolicy', svcMsg: {id: 'nice', type: ['a']}, error: {id: 'error'}},
        cfg = {};
    cfg[LOG_P.useLogEntries] = 'true';
    logSomeJSON(loggerFactory.create(cfg), json);
  });

  it('log some JSON with a svcRequest', function() {
    var json = {serviceType: 'UP', action: 'messageOnly', svcRequest: {id: 'nice', type: ['a']}},
        cfg = {};
    cfg[LOG_P.useLogEntries] = 'true';
    logSomeJSON(loggerFactory.create(cfg), json);
  });

  it('log some JSON with a svcResponse', function() {
    var json = {serviceType: 'UP', action: 'messageOnly', svcResponse: {id: 'nice', type: ['a']}},
        cfg = {};
    cfg[LOG_P.useLogEntries] = 'true';
    logSomeJSON(loggerFactory.create(cfg), json);
  });

  it('log some JSON with a policy', function() {
    var json = {serviceType: 'UP', action: 'policyOnly', policy: {id: 'nice', type: ['a']}},
        cfg = {};
    cfg[LOG_P.useLogEntries] = 'true';
    logSomeJSON(loggerFactory.create(cfg), json);
  });

  it('log some JSON with metadata', function() {
    var json = {serviceType: 'UP', action: 'metadataOnly', metadata: {id: 'nice', type: ['a']}},
        cfg = {};
    cfg[LOG_P.useLogEntries] = 'true';
    logSomeJSON(loggerFactory.create(cfg), json);
  });

  it('log some JSON with data', function() {
    var json = {serviceType: 'UP', action: 'metadataOnly', data: {id: 'nice', type: ['a']}},
        cfg = {};
    cfg[LOG_P.useLogEntries] = 'true';
    logSomeJSON(loggerFactory.create(cfg), json);
  });

});