/*jslint node: true, vars: true */
const assert = require('assert');
const HttpStatus = require('http-status');
const nock = require('nock');
const apigwRequestWrapper = require('../lib/apigwRequestWrapper');
const should = require('should');
const util = require('util');

describe('apigwRequestWrapper postJWT Tests', function () {
  'use strict';

  let dummyServiceCtx = {
    name: 'a-service',
    logger: { logJSON: function (mode, msg) { console.log('%s %j', mode, msg); } },
  };

  const postURL = 'http://test12.apigw.bogus.webshield.io/query';

  describe('1 promise post JWT no domain', function () {

    it('1.1 should post JWT to requested url and return the result', function () {

      let sendJWT = 'fake-JWT';

      // nock out the POST
      nock('http://test12.apigw.bogus.webshield.io')
          .log(console.log)
          .post('/query')
          .reply(HttpStatus.OK, function (uri, requestBody) {
            requestBody.should.be.equal(sendJWT);
            this.req.headers.should.have.property('content-type', 'text/plain');
            return 'return-fake-JWT';
          });

      return apigwRequestWrapper.promises.postJWT(dummyServiceCtx, 'msg-id-1', postURL, sendJWT)
        .then(function (response) {
          response.should.have.property('statusCode', HttpStatus.OK);
          response.body.should.be.equal('return-fake-JWT');
          return true;
        })
        .catch(function (err) {
          assert(false, util.format('Unexpected error POST JWT: %j', err));
        });
    }); //it 1.1

  }); // describe 1

}); // describe
