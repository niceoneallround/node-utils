/*jslint node: true, vars: true */
var assert = require('assert'),
  HttpStatus = require('http-status'),
  nock = require('nock'),
  requestWrapper = require('../lib/requestWrapper'),
  should = require('should'),
  util = require('util');

describe('restServer Tests', function () {
  'use strict';

  describe('1 test POST JWT', function () {

    it('1.1 should be able to post JWT to another URL', function (done) {
      var props, url = 'https://bogus.webshield.io/test41',
          jwtM = '7282822882-bogus',
          nockScope;

      // nock out the POST call
      nock.cleanAll(); // remove any left over nocks

      // nock out the GET for the home document
      nockScope = nock('https://bogus.webshield.io')
            .log(console.log)
            .post('/test41')
            .reply(HttpStatus.OK, function (uri, requestBody) {
              uri.should.equal('/test41');
              requestBody.should.be.equal(jwtM);
              this.req.headers.should.have.property('content-type', 'text/plain');
              console.log('---headers:%j', this.req.headers);
              return 'what-is-this';
            });

      props = {};
      props.url = url;
      props.jwt = jwtM;
      requestWrapper.postJWT(props, function (err, response, body) {
        assert(!err, util.format('Unexpected error starting on POST: %j', err));
        response.should.have.property('statusCode', HttpStatus.OK);
        body.should.be.equal('what-is-this');
        console.log('response:%j', response);
        done();
      });
    }); //it 4.1

  }); // describe 1

}); // describe
