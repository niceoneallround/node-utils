/*jslint node: true, vars: true */
var assert = require('assert'),
  HttpStatus = require('http-status'),
  nock = require('nock'),
  apigwRequestWrapper = require('../lib/apigwRequestWrapper'),
  should = require('should'),
  util = require('util');

describe('apigwRequestWrapper Tests', function () {
  'use strict';

  describe('1 test post createPrivacyPipe', function () {

    it('1.1 should create a jwt and post to the pb using a callback', function (done) {
      var props,
          ppJWT = 'a-fake-jwt',
          nockScope,
          apigwUrl = 'https://test11.apigw.bogus.webshield.io',
          domainIdParam = 'fake-domain';

      props = {};
      props.domainIdParam = 'fake-domain';
      props.loggerMsgId = '11';
      props.logMsgServiceName = 'test11';
      props.logger = { logJSON: function (mode, msg) { console.log('%s %j', mode, msg); } };

      // nock out the POST
      nockScope = nock(apigwUrl)
            .log(console.log)
            .post(apigwRequestWrapper.utils.generateCreatePipePathUrl(domainIdParam))
            .reply(HttpStatus.OK, function (uri, requestBody) {
              requestBody.should.be.equal(ppJWT);
              this.req.headers.should.have.property('content-type', 'text/plain');
              return 'return-fake-JWT';
            });

      apigwRequestWrapper.callbacks.postCreatePrivacyPipeJWT(props, apigwUrl, ppJWT, function (err, response, outputJWT) {
        assert(!err, util.format('Unexpected error starting on POST: %j', err));
        response.should.have.property('statusCode', HttpStatus.OK);
        outputJWT.should.be.equal('return-fake-JWT');
        done();
      });
    }); //it 1.1

    it('1.2 should create a jwt and post to the pb using a promise', function () {
      var props,
          ppJWT = 'a-fake-jwt',
          nockScope,
          apigwUrl = 'http://test12.apigw.bogus.webshield.io', pbPath,
          promiseResponse,
          domainIdParam = 'fake-domain';

      props = {};
      props.domainIdParam = 'fake-domain';
      props.loggerMsgId = '12';
      props.logMsgServiceName = 'test12';
      props.logMsgPrefix = 'a-prefix';
      props.logger = { logJSON: function (mode, msg) { console.log('%s %j', mode, msg); } };

      // nock out the POST
      pbPath = apigwRequestWrapper.utils.generateCreatePipePathUrl(domainIdParam);
      nockScope = nock(apigwUrl)
            .log(console.log)
            .post(pbPath) //'/v1/domains/fake-domain/privacy_pipe')
            .reply(HttpStatus.OK, function (uri, requestBody) {
              requestBody.should.be.equal(ppJWT);
              this.req.headers.should.have.property('content-type', 'text/plain');
              return 'return-fake-JWT';
            });

      promiseResponse = apigwRequestWrapper.promises.postCreatePrivacyPipeJWT(props, apigwUrl, ppJWT);
      return promiseResponse
        .then(function (response) {
          response.should.have.property('statusCode', HttpStatus.OK);
          response.body.should.be.equal('return-fake-JWT');
          return true;
        })
        .catch(function (err) {
          assert(false, util.format('Unexpected error POST create privacy pipe as a promise: %j', err));
        });
    }); //it 1.2
  }); // describe 1

}); // describe
