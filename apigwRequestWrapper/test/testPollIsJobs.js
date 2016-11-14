/*jslint node: true, vars: true */
var //assert = require('assert'),
  apigwRequestWrapper = require('../lib/apigwRequestWrapper'),
  HttpStatus = require('http-status'),
  nock = require('nock'),
  should = require('should'),
  MOCHA_TIMEOUT = 5000;

describe('Poll IS Jobs Tests', function () {
  'use strict';

  this.timeout(MOCHA_TIMEOUT); // set max timeout

  describe('1 poll IS jobs', function () {

    it('1.1 should poll until all jobs complete', function (done) {
      var props, domainIdParam = 'fake-domain', fetchJobNockScope, jobPath,
          apigwUrl = 'http://test11.apigw.bogus.webshield.io';

      props = {};
      props.wait = 500;
      props.maxRetries = 2;
      props.domainIdParam = domainIdParam;
      props.loggerMsgId = '12';
      props.logMsgServiceName = 'test11';
      props.logMsgPrefix = 'a-prefix';
      props.logger = { logJSON: function (mode, msg) { console.log('%s %j', mode, msg); } };

      // nock out first call to API gw
      jobPath = apigwRequestWrapper.utils.generateGetIsJobPathUrl(domainIdParam);
      fetchJobNockScope = nock(apigwUrl)
          .log(console.log)
          .get(jobPath)
          .reply(function () { // not used uri, requestBody) {
            return [
              HttpStatus.OK,
              'dont-care-jwt',
              { 'content-type': 'text/plain' }
            ];
          });

      // nock out 2nd call
      fetchJobNockScope = nock(apigwUrl)
          .log(console.log)
          .get(jobPath)
          .reply(function () { // not used uri, requestBody) {
            return [
              HttpStatus.OK,
              'dont-care-jwt',
              { 'content-type': 'text/plain' }
            ];
          });

      apigwRequestWrapper.callbacks.pollIsJobsComplete(props, apigwUrl, function (err, jobs) {
        console.log('.............err:%s', err);
        console.log('.............jobs:%s', jobs);
        done();
      });
    }); //it 1.1

  }); // describe 1

}); // describe
