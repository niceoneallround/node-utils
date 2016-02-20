/*jslint node: true, vars: true */
var assert = require('assert'),
  loggerFactory = require('../../logger/lib/logger'),
  HttpStatus = require('http-status'),
  restServiceFactory = require('../lib/restServer'),
  restify = require('restify'),
  should = require('should'),
  util = require('util');

describe('restServer Tests', function () {
  'use strict';

  describe('1 management tests', function () {
    var restService1;

    before(function (done) {
      var props = {};
      props.name = 'Test 1';
      props.baseURL = '/baseURL';
      props.URLversion = 'v1';
      props.port = 3100;
      restService1 = restServiceFactory.create(props);

      restService1.start(function (err) {
        assert(!err, util.format('Unexpected error starting service: %j', err));
        done();
      });
    });

    it('1.1 should be able to stop the service', function (done) {
      restService1.stop(function (err) {
        assert(!err, util.format('Unexpected error stopping service: %j', err));
        done();
      });
    }); //it 1.1

    it('1.2 should be able to create with passed in logger', function (done) {
      var restService2, props = {};

      props.name = 'test 1.2';
      props.logger = loggerFactory.create(null);
      props.baseURL = '/baseURL';
      props.URLversion = 'v1';
      props.port = 3200;
      restService2 = restServiceFactory.create(props);

      restService2.logger().should.be.equal(props.logger);
      done();

    }); //it 1.2

  }); // describe 1

  describe('2 GET tests', function () {

    var restService2, client;

    before(function (done) {
      var props = {};
      props.name = 'Test 2';
      props.baseURL = '/baseURL';
      props.URLversion = 'v1';
      props.port = 3101;
      restService2 = restServiceFactory.create(props);

      restService2.start(function (err) {
        assert(!err, util.format('Unexpected error starting service2: %j', err));

        client = restify.createJsonClient({ url: 'http://localhost:' + props.port });
        done();
      });
    });

    it('2.1 register a handler on a path that returns 200 response, and GET it', function (done) {

      var handler11 = {}, sendData = { get: 'hello' };

      handler11.get = function (req, res, cb) {
        assert(req, 'No req passed to handler');
        assert(res, 'No res passed to handler');
        return cb(null, sendData);
      };

      restService2.registerGETHandler('/path_ok', handler11);

      client.get('/baseURL/v1/path_ok', function (err, req, res, data) {
        assert(!err, util.format('Unexpected error starting on GET: %j', err));
        assert(req, 'No req passed from client');
        assert(res, 'No res passed from client');
        assert(data, 'No data passed from server');

        res.statusCode.should.be.equal(HttpStatus.OK);
        res.header('content-type').should.be.equal('application/json');

        //console.log('StatusCode:%d -- headers:%j', res.statusCode, res.headers);
        //console.log('response data json:%j', data);

        data.should.have.property('get');
        data.should.have.property('get', 'hello');
        done();
      });
    }); //it 2.1
  }); // describe 2

  describe('3 POST tests', function () {

    var restService3, client;

    before(function (done) {
      var props = {};
      props.name = 'Test 3';
      props.baseURL = '/baseURL';
      props.URLversion = 'v1';
      props.port = 3102;
      restService3 = restServiceFactory.create(props);

      // start the service
      restService3.start(function (err) {
        assert(!err, util.format('Unexpected error starting service2: %j', err));

        client = restify.createJsonClient({ url: 'http://localhost:' + props.port });
        done();
      });
    });

    it('3.1 register a POST handler on a path that returns 200 and some data in the response', function (done) {

      var handler21 = {}, postData = { hello: 'world2' }, responseData = { post: 'response' };

      handler21.post = function (req, res, cb) {
        req.body.should.have.property('hello');
        res.setHeader('content-type', 'application/json');
        res.send(responseData);
        return cb(null);
      };

      restService3.registerPOSTHandler('/path_ok', handler21);

      client.post('/baseURL/v1/path_ok', postData, function (err, req, res, data) {
        assert(!err, util.format('Unexpected error starting on POST: %j', err));
        assert(data, 'No data passed from server');

        //console.log('StatusCode:%d -- headers:%j', res.statusCode, res.headers);
        //console.log('response data string:%s, json:%j', data, JSON.parse(data));

        res.header('content-type').should.be.equal('application/json');
        res.statusCode.should.be.equal(HttpStatus.OK);
        data.should.have.property('post', 'response');
        done();
      });
    }); //it 3.1
  }); // describe 3

}); // describe
