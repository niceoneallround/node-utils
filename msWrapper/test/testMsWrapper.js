/*jslint node: true, vars: true */
var assert = require('assert'),
  HttpStatus = require('http-status'),
  nock = require('nock'),
  msWrapper = require('../lib/msWrapper'),
  should = require('should'),
  util = require('util');

describe('restServer Tests', function () {
  'use strict';

  describe('1 test GET Metadata', function () {

    it('1.1 should be able get a URL', function (done) {
      var props = {},
          mdId = 'md_id',
          msUrl = 'https://bogus.webshield.io/test31/metadata/23',
          nockScope,
          promiseMetadata;

      props.loggerMsgId = '23';
      props.logMsgServiceName = 'service-name';
      props.logMsgPrefix = 'a-prefix';
      props.logger = { logJSON: function (mode, msg) { console.log('%s %j', mode, msg); } };

      // nock out the POST call
      nock.cleanAll(); // remove any left over nocks

      // nock out the GET for the home document
      nockScope = nock('https://bogus.webshield.io')
            .log(console.log)
            .get('/test31/metadata/23')
            .reply(function () { // not used uri, requestBody) {
              return [
                HttpStatus.OK,
                'mock-jwt',
                { 'content-type': 'text/plain' }
              ];
            });

      promiseMetadata = msWrapper.promises.promiseMetadata(mdId, msUrl, props);

      promiseMetadata
        .then(
          function (mdJWT) {
            mdJWT.should.be.equal('mock-jwt');
            done();

          },

          function (err) {
            console.log('Returned err:%s', err);
            assert(false, util.format('1.1 Should not have have returned an error:%s', err));
            done();
          }
        )
        .catch(function (err) {
          console.log('catch err:%s', err);
          assert(false, util.format('1.1 Should not have caught an error:%s', err));
          done();
        });

    }); //it 1.1

    it('1.2 test md not found', function (done) {
      var props = {},
          mdId = 'md_id',
          msUrl = 'https://bogus.webshield.io/test31/metadata/23',
          nockScope,
          promiseMetadata;

      props.loggerMsgId = '23';
      props.logMsgServiceName = 'service-name';
      props.logMsgPrefix = 'a-prefix';
      props.logger = { logJSON: function (mode, msg) { console.log('%s %j', mode, msg); } };

      // nock out the POST call
      nock.cleanAll(); // remove any left over nocks

      // nock out the GET for the home document
      nockScope = nock('https://bogus.webshield.io')
            .log(console.log)
            .get('/test31/metadata/23')
            .reply(function () { // not used uri, requestBody) {
              return [
                HttpStatus.NOT_FOUND,
                null,
                { 'content-type': 'text/plain' }
              ];
            });

      promiseMetadata = msWrapper.promises.promiseMetadata(mdId, msUrl, props);

      promiseMetadata
        .then(
          function (mdJWT) {
            mdJWT.should.be.equal('mock-jwt');
            done();

          },

          function (err) {
            err.should.be.equal(404);
            done();
          }
        )
        .catch(function (err) {
          console.log('catch err:%s', err);
          assert(false, util.format('1.2 Should not have caught an error:%s', err));
          done();
        });

    }); //it 1.2
  }); // describe 1

}); // describe
