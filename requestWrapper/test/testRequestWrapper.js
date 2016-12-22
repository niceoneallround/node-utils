/*jslint node: true, vars: true */
const assert = require('assert');
const HttpStatus = require('http-status');
const nock = require('nock');
const requestWrapper = require('../lib/requestWrapper');
const requestWrapperPromises = require('../lib/requestWrapper').promises;
const should = require('should');
const util = require('util');

// have many names to can pick up when filter mocha
describe('requestWrapper requestwrapper Tests', function () {
  'use strict';

  describe('1 test POST JWT', function () {

    it('1.1 should be able to post JWT to another URL', function (done) {
      let url = 'https://bogus.webshield.io/test11';
      let jwtM = '7282822882-bogus';

      // nock out the POST call
      nock.cleanAll(); // remove any left over nocks

      // nock out the GET for the home document
      nock('https://bogus.webshield.io')
            .log(console.log)
            .post('/test11')
            .reply(HttpStatus.OK, function (uri, requestBody) {
              uri.should.equal('/test11');
              requestBody.should.be.equal(jwtM);
              this.req.headers.should.have.property('content-type', 'text/plain');
              return 'what-is-this';
            });

      let props = {};
      props.url = url;
      props.jwt = jwtM;
      requestWrapper.postJWT(props, function (err, response, body) {
        assert(!err, util.format('Unexpected error starting on POST: %j', err));
        response.should.have.property('statusCode', HttpStatus.OK);
        body.should.be.equal('what-is-this');
        done();
      });
    }); //it 1.1

    it('1.2 should support a promise version', function () {
      let url = 'https://bogus.webshield.io/test12';
      let jwtM = '7282822882-bogus';

      // nock out the POST call
      nock.cleanAll(); // remove any left over nocks

      // nock out the GET for the home document
      nock('https://bogus.webshield.io')
            .log(console.log)
            .post('/test12')
            .reply(HttpStatus.OK, function (uri, requestBody) {
              uri.should.equal('/test12');
              requestBody.should.be.equal(jwtM);
              this.req.headers.should.have.property('content-type', 'text/plain');
              return 'what-is-this';
            });

      let props = {};
      props.url = url;
      props.jwt = jwtM;
      return requestWrapperPromises.postJWT(props)
        .then(function (response) {
          response.should.have.property('statusCode', HttpStatus.OK);
          response.body.should.be.equal('what-is-this');
        });
    }); //it 1.2

  }); // describe 1

  describe('2 test GET JWT', function () {

    it('2.1 should be able get a JWT from a URL', function (done) {
      let url = 'https://bogus.webshield.io/test21';
      let jwtM = '7282822882-bogus';

      // nock out the POST call
      nock.cleanAll(); // remove any left over nocks

      // nock out the GET for the home document
      nock('https://bogus.webshield.io')
            .log(console.log)
            .get('/test21')
            .reply(HttpStatus.OK, function (uri, requestBody) {
              uri.should.equal('/test21');
              assert(!requestBody, util.format('Did not expect a request body:%j', requestBody));
              return jwtM;
            });

      let props = {};
      props.url = url;
      requestWrapper.getJWT(props, function (err, response, body) {
        assert(!err, util.format('Unexpected error starting on POST: %j', err));
        response.should.have.property('statusCode', HttpStatus.OK);
        body.should.be.equal(jwtM);
        done();
      });
    }); //it 2.1

    it('2.2 should support a promise version', function () {
      let url = 'https://bogus.webshield.io/test22';
      let jwtM = '7282822882-bogus';

      // nock out the POST call
      nock.cleanAll(); // remove any left over nocks

      // nock out the GET for the home document
      nock('https://bogus.webshield.io')
            .log(console.log)
            .get('/test22')
            .reply(HttpStatus.OK, function (uri, requestBody) {
              uri.should.equal('/test22');
              assert(!requestBody, util.format('Did not expect a request body:%j', requestBody));
              return jwtM;
            });

      let props = {};
      props.url = url;
      return requestWrapperPromises.getJWT(props)
        .then(function (response) {
          response.should.have.property('statusCode', HttpStatus.OK);
          response.body.should.be.equal(jwtM);
        });
    }); //it 2.2
  }); // describe 2

  describe('3 test GET JWT', function () {

    it('3.1 should be able get a URL', function (done) {
      var props, url = 'https://bogus.webshield.io/test31',
          body = '7282822882-bogus',
          nockScope;

      // nock out the POST call
      nock.cleanAll(); // remove any left over nocks

      // nock out the GET for the home document
      nockScope = nock('https://bogus.webshield.io')
            .log(console.log)
            .get('/test31')
            .reply(HttpStatus.OK, function (uri, requestBody) {
              uri.should.equal('/test31');
              assert(!requestBody, util.format('Did not expect a request body:%j', requestBody));
              return body;
            });

      props = {};
      props.url = url;
      requestWrapper.getJWT(props, function (err, response, body) {
        assert(!err, util.format('Unexpected error starting on POST: %j', err));
        response.should.have.property('statusCode', HttpStatus.OK);
        body.should.be.equal(body);
        done();
      });
    }); //it 2.1
  }); // describe 3

  describe('4 test POST JWT with extra headers', function () {

    it('4.1 should be able to post JWT to another URL', function (done) {
      let url = 'https://bogus.webshield.io/test41';
      let jwtM = '7282822882-bogus';

      // nock out the POST call
      nock.cleanAll(); // remove any left over nocks

      // nock out the POST for the home document
      nock('https://bogus.webshield.io')
            .log(console.log)
            .post('/test41')
            .reply(HttpStatus.OK, function (uri, requestBody) {
              uri.should.equal('/test41');
              requestBody.should.be.equal(jwtM);
              this.req.headers.should.have.property('content-type', 'text/plain');
              return 'what-is-this';
            });

      let props = {};
      props.url = url;
      props.jwt = jwtM;
      props.headers = new Map();
      props.headers.set('X-my-example-header', '23');
      requestWrapper.postJWT(props, function (err, response, body) {
        assert(!err, util.format('Unexpected error starting on POST: %j', err));
        response.should.have.property('statusCode', HttpStatus.OK);
        body.should.be.equal('what-is-this');
        done();
      });
    }); //it 4.1

    it('4.2 should support a promise version', function () {
      let url = 'https://bogus.webshield.io/test42';
      let jwtM = '7282822882-bogus';

      // nock out the POST call
      nock.cleanAll(); // remove any left over nocks

      // nock out the POST for the home document
      nock('https://bogus.webshield.io')
            .log(console.log)
            .post('/test42')
            .reply(HttpStatus.OK, function (uri, requestBody) {
              uri.should.equal('/test42');
              requestBody.should.be.equal(jwtM);
              this.req.headers.should.have.property('content-type', 'text/plain');
              return 'what-is-this';
            });

      let props = {};
      props.url = url;
      props.jwt = jwtM;
      props.headers = new Map();
      props.headers.set('X-my-example-header', '23');
      return requestWrapperPromises.postJWT(props)
        .then(function (response) {
          response.should.have.property('statusCode', HttpStatus.OK);
          response.body.should.be.equal('what-is-this');
        });
    }); //it 4.2

  }); // describe 4

  describe('5 test POST JSON', function () {

    it('5.1 should be able to post JSON to another URL', function (done) {
      let url = 'https://bogus.webshield.io/test51';
      let json = { id: 'some_json' };

      // nock out the POST call
      nock.cleanAll(); // remove any left over nocks

      // nock out the GET for the home document
      nock('https://bogus.webshield.io')
            .log(console.log)
            .post('/test51')
            .reply(HttpStatus.OK, function (uri, requestBody) {
              uri.should.equal('/test51');
              requestBody.should.have.property('id', 'some_json');
              this.req.headers.should.have.property('content-type', 'application/json');
              return 'what-is-this';
            });

      let props = {};
      props.url = url;
      props.json = json;
      requestWrapper.postJSON(props, function (err, response, body) {
        assert(!err, util.format('Unexpected error starting on POST: %j', err));
        response.should.have.property('statusCode', HttpStatus.OK);
        body.should.be.equal('what-is-this');
        done();
      });
    }); //it 5.1

    it('5.2 should support a promise version', function () {
      let url = 'https://bogus.webshield.io/test52';
      let json = { id: 'some_json' };

      // nock out the POST call
      nock.cleanAll(); // remove any left over nocks

      // nock out the GET for the home document
      nock('https://bogus.webshield.io')
            .log(console.log)
            .post('/test52')
            .reply(HttpStatus.OK, function (uri, requestBody) {
              uri.should.equal('/test52');
              requestBody.should.have.property('id', 'some_json');
              this.req.headers.should.have.property('content-type', 'application/json');
              return 'what-is-this';
            });

      let props = {};
      props.url = url;
      props.json = json;
      return requestWrapperPromises.postJSON(props)
        .then(function (response) {
          response.should.have.property('statusCode', HttpStatus.OK);
          response.body.should.be.equal('what-is-this');
        });
    }); //it 5.2

  }); // describe 5

  describe('6 test POST text with query params', function () {

    it('6.1 should be able to post a URL with query params', function (done) {
      var props, url = 'https://bogus.webshield.io/test61',
          nockScope;

      // nock out the POST call
      nock.cleanAll(); // remove any left over nocks

      // nock out the GET for the home document
      nockScope = nock('https://bogus.webshield.io')
            .log(console.log)
            .post('/test61')
            .query({ param1: 1, param2: 2 })
            .reply(HttpStatus.OK, function (uri, requestBody) {
              uri.should.equal('/test61?param1=1&param2=2');
              requestBody.should.be.equal('some_text');
              this.req.headers.should.have.property('content-type', 'text/plain; charset=utf-8');
              return 'what-is-this';
            });

      props = {};
      props.url = url;
      props.text = 'some_text';
      props.qs = { param1: 1, param2: 2 };
      requestWrapper.post(props, function (err, response, body) {
        assert(!err, util.format('Unexpected error starting on POST: %j', err));
        response.should.have.property('statusCode', HttpStatus.OK);
        body.should.be.equal('what-is-this');
        done();
      });
    }); //it 6.1

  }); // describe 6

  describe('7 test GET with header params', function () {

    it('7.1 should be able get a URL', function (done) {
      var props, url = 'https://bogus.webshield.io/test71',
          body = '7282822882-bogus',
          nockScope;

      // nock out the POST call
      nock.cleanAll(); // remove any left over nocks

      // nock out the GET for the home document
      nockScope = nock('https://bogus.webshield.io')
            .log(console.log)
            .matchHeader('x-api-key', '23')
            .get('/test71')
            .reply(HttpStatus.OK, function (uri, requestBody) {
              uri.should.equal('/test71');
              assert(!requestBody, util.format('Did not expect a request body:%j', requestBody));
              return body;
            });

      props = {};
      props.url = url;
      props.headers = new Map();
      props.headers.set('x-api-key', '23');
      requestWrapper.get(props, function (err, response, body) {
        assert(!err, util.format('Unexpected error starting on POST: %j', err));
        response.should.have.property('statusCode', HttpStatus.OK);
        body.should.be.equal(body);
        done();
      });
    }); //it 7.1
  }); // describe 7

  describe('8 test generate basic auth token ', function () {

    it('8.1 test it', function () {
      var username = 'rich', password = 'richer', result;

      result = requestWrapper.generateBasicAuthTokenForHeader(username, password);
      result.should.be.equal('Basic ' + new Buffer(username + ':' + password).toString('base64'));

    }); //it 8.1
  }); // describe 8

}); // describe
