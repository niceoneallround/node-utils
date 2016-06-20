/*jslint node: true, vars: true */
var assert = require('assert'),
  HttpStatus = require('http-status'),
  nock = require('nock'),
  apigwRequestWrapper = require('../lib/apigwRequestWrapper'),
  should = require('should'),
  util = require('util');

describe('Metadata operations apigwRequestWrapper Tests', function () {
  'use strict';

  describe('1 test fetch metadata', function () {

    it('1.1 fetch a metadata', function () {
      var props,
          fetchNockScope, mdPath,
          apigwUrl = 'http://test11.apigw.bogus.webshield.io',
          promiseResponse,
          domainIdParam = 'fake-domain',
          mdIdParam = 'fake-md';

      props = {};
      props.domainIdParam = domainIdParam;
      props.mdIdParam = mdIdParam;
      props.loggerMsgId = '12';
      props.logMsgServiceName = 'test11';
      props.logMsgPrefix = 'a-prefix';
      props.logger = { logJSON: function (mode, msg) { console.log('%s %j', mode, msg); } };

      // nock out the GET from the wrapper to the APIGW
      mdPath = apigwRequestWrapper.utils.generateFetchMetadataPathUrl(domainIdParam, mdIdParam);
      fetchNockScope = nock(apigwUrl)
          .log(console.log)
          .get(mdPath)
          .reply(function () { // not used uri, requestBody) {
            return [
              HttpStatus.OK,
              'dont-care-jwt',
              { 'content-type': 'text/plain' }
            ];
          });

      promiseResponse = apigwRequestWrapper.promises.fetchMetadataJWT(props, apigwUrl);
      return promiseResponse
        .then(function (response) {
          response.should.have.property('statusCode', HttpStatus.OK);
          response.body.should.be.equal('dont-care-jwt');
          return;
        })
        .catch(function (err) {
          assert(false, util.format('Unexpected error fetchMetadataJWT as a promise: %j', err));
        });
    }); //it 1.1

    it('1.2 test create metadata should call APIGW URL on create metadata', function () {
      var props,
          mdJWT = 'a-fake-jwt', mdPath, domainIdParam = 'fake-domain-22',
          nockScope,
          apigwUrl = 'http://test12.apigw.bogus.webshield.io',
          promiseResponse;

      props = {};
      props.domainIdParam = domainIdParam;
      props.loggerMsgId = '12';
      props.logMsgServiceName = 'test12';
      props.logMsgPrefix = 'a-prefix';
      props.logger = { logJSON: function (mode, msg) { console.log('%s %j', mode, msg); } };

      // nock out the POST
      mdPath = apigwRequestWrapper.utils.generatePostMetadataPathUrl(domainIdParam);
      nockScope = nock(apigwUrl)
            .log(console.log)
            .post(mdPath)
            .reply(HttpStatus.OK, function (uri, requestBody) {
              requestBody.should.be.equal(mdJWT);
              this.req.headers.should.have.property('content-type', 'text/plain');
              return 'return-fake-JWT';
            });

      promiseResponse = apigwRequestWrapper.promises.postMetadataJWT(props, apigwUrl, mdJWT);
      return promiseResponse
        .then(function (response) {
          response.should.have.property('statusCode', HttpStatus.OK);
          response.body.should.be.equal('return-fake-JWT');
          return true;
        })
        .catch(function (err) {
          assert(false, util.format('Unexpected error POST create md: %j', err));
        });
    }); //it 1.2
  }); // describe 1

}); // describe
