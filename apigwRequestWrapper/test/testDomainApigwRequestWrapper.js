/*jslint node: true, vars: true */
var assert = require('assert'),
  HttpStatus = require('http-status'),
  nock = require('nock'),
  apigwRequestWrapper = require('../lib/apigwRequestWrapper'),
  should = require('should'),
  util = require('util');

describe('Domain operations apigwRequestWrapper Tests', function () {
  'use strict';

  describe('1 test fetch domain', function () {

    it('1.1 fetch a domain', function () {
      var props,
          fetchNockScope, domainPath,
          apigwUrl = 'http://test11.apigw.bogus.webshield.io',
          promiseResponse,
          domainIdParam = 'fake-domain';

      props = {};
      props.domainIdParam = domainIdParam;
      props.loggerMsgId = '12';
      props.logMsgServiceName = 'test11';
      props.logMsgPrefix = 'a-prefix';
      props.logger = { logJSON: function (mode, msg) { console.log('%s %j', mode, msg); } };

      // nock out the GET from the wrapper to the APIGW
      domainPath = apigwRequestWrapper.utils.generateFetchDomainPathUrl(domainIdParam);
      fetchNockScope = nock(apigwUrl)
          .log(console.log)
          .get(domainPath)
          .reply(function () { // not used uri, requestBody) {
            return [
              HttpStatus.OK,
              'dont-care-jwt',
              { 'content-type': 'text/plain' }
            ];
          });

      promiseResponse = apigwRequestWrapper.promises.fetchDomainJWT(props, apigwUrl);
      return promiseResponse
        .then(function (response) {
          response.should.have.property('statusCode', HttpStatus.OK);
          response.body.should.be.equal('dont-care-jwt');
          return;
        })
        .catch(function (err) {
          assert(false, util.format('Unexpected error fetchDomainJWT as a promise: %j', err));
        });
    }); //it 1.1

    it('1.2 test create domain should call APIGW URL on create domain', function () {
      var props,
          domainJWT = 'a-fake-jwt', domainPath,
          nockScope,
          apigwUrl = 'http://test12.apigw.bogus.webshield.io',
          promiseResponse;

      props = {};
      props.loggerMsgId = '12';
      props.logMsgServiceName = 'test12';
      props.logMsgPrefix = 'a-prefix';
      props.logger = { logJSON: function (mode, msg) { console.log('%s %j', mode, msg); } };

      // nock out the POST
      domainPath = apigwRequestWrapper.utils.generateCreateDomainPathUrl();
      nockScope = nock(apigwUrl)
            .log(console.log)
            .post(domainPath)
            .reply(HttpStatus.OK, function (uri, requestBody) {
              requestBody.should.be.equal(domainJWT);
              this.req.headers.should.have.property('content-type', 'text/plain');
              return 'return-fake-JWT';
            });

      promiseResponse = apigwRequestWrapper.promises.createDomainJWT(props, apigwUrl, domainJWT);
      return promiseResponse
        .then(function (response) {
          response.should.have.property('statusCode', HttpStatus.OK);
          response.body.should.be.equal('return-fake-JWT');
          return true;
        })
        .catch(function (err) {
          assert(false, util.format('Unexpected error POST create domain: %j', err));
        });
    }); //it 1.2
  }); // describe 1

}); // describe
