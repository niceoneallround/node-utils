/*jslint node: true, vars: true */
var assert = require('assert'),
  HttpStatus = require('http-status'),
  nock = require('nock'),
  pbRequestWrapper = require('../lib/pbRequestWrapper'),
  should = require('should'),
  util = require('util');

describe('pbRequestWrapper Tests', function () {
  'use strict';

  describe('1 test post createPrivacyPipe', function () {

    it('1.1 should create a jwt and post to the pb using a callback', function (done) {
      var props,
          ppJWT = 'a-fake-jwt',
          nockScope,
          pbUrl = 'https://test11.pb.bogus.webshield.io',
          domainIdParam = 'fake-domain';

      props = {};
      props.domainIdParam = 'fake-domain';
      props.loggerMsgId = '11';
      props.logMsgServiceName = 'test11';
      props.logger = { logJSON: function (mode, msg) { console.log('%s %j', mode, msg); } };

      // nock out the POST
      nockScope = nock(pbUrl)
            .log(console.log)
            .post(pbRequestWrapper.utils.generateCreatePipePathUrl(domainIdParam))
            .reply(HttpStatus.OK, function (uri, requestBody) {
              requestBody.should.be.equal(ppJWT);
              this.req.headers.should.have.property('content-type', 'text/plain');
              return 'return-fake-JWT';
            });

      pbRequestWrapper.callbacks.postCreatePrivacyPipeJWT(props, pbUrl, ppJWT, function (err, response, outputJWT) {
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
          pbUrl = 'http://test12.pb.bogus.webshield.io', pbPath,
          promiseResponse,
          domainIdParam = 'fake-domain';

      props = {};
      props.domainIdParam = 'fake-domain';
      props.loggerMsgId = '12';
      props.logMsgServiceName = 'test12';
      props.logMsgPrefix = 'a-prefix';
      props.logger = { logJSON: function (mode, msg) { console.log('%s %j', mode, msg); } };

      // nock out the POST
      pbPath = pbRequestWrapper.utils.generateCreatePipePathUrl(domainIdParam);
      nockScope = nock(pbUrl)
            .log(console.log)
            .post(pbPath) //'/v1/domains/fake-domain/privacy_pipe')
            .reply(HttpStatus.OK, function (uri, requestBody) {
              requestBody.should.be.equal(ppJWT);
              this.req.headers.should.have.property('content-type', 'text/plain');
              return 'return-fake-JWT';
            });

      promiseResponse = pbRequestWrapper.promises.postCreatePrivacyPipeJWT(props, pbUrl, ppJWT);
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
