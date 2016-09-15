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

      //create a server to stop
      var props = {}, restServer2Stop;
      props.name = 'Test 1';
      props.baseURL = '/baseURL';
      props.URLversion = 'v1';
      props.port = 3199;
      restServer2Stop = restServiceFactory.create(props);

      restServer2Stop.start(function (err) {
        assert(!err, util.format('Unexpected error starting service: %j', err));

        console.log('*********** stopping server');
        restServer2Stop.stop(function (err) {
          assert(!err, util.format('Unexpected error stopping service: %j', err));
          done();
        });
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

  describe('2 GET handler tests', function () {

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

      var handler21 = {}, sendData = { get: 'hello' };

      handler21.get = function (req, res, cb) {
        assert(req, 'No req passed to handler');
        assert(res, 'No res passed to handler');
        return cb(null, sendData);
      };

      restService2.registerGETHandler('/path_21', handler21);

      client.get('/baseURL/v1/path_21', function (err, req, res, data) {
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

    it('2.2 register a handler on a path that returns text/plain and GET it', function (done) {

      var handler22 = {}, sendData = { get: 'hello' };

      handler22.get = function (req, res, cb) {
        assert(req, 'No req passed to handler');
        assert(res, 'No res passed to handler');
        res.setHeader('content-type', 'text/plain');
        return cb(null, sendData);
      };

      restService2.registerGETHandler('/path_22', handler22);

      client.get('/baseURL/v1/path_22', function (err, req, res, data) {
        assert(!err, util.format('Unexpected error starting on GET: %j', err));
        assert(req, 'No req passed from client');
        assert(res, 'No res passed from client');
        assert(data, 'No data passed from server');

        res.statusCode.should.be.equal(HttpStatus.OK);
        res.header('content-type').should.be.equal('text/plain');
        data.should.have.property('get');
        data.should.have.property('get', 'hello');
        done();
      });
    }); //it 2.1
  }); // describe 2

  describe('3 POST handler tests', function () {

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

    it('3.1 register a POST handler on a path that returns data and uses default props', function (done) {

      var handler31 = {}, postData = { hello: 'world2' }, responseData = { post: 'response' };

      handler31.post = function (req, res, cb) {
        req.body.should.have.property('hello');
        return cb(null, responseData);
      };

      restService3.registerPOSTHandler('/path_ok31', handler31);

      client.post('/baseURL/v1/path_ok31', postData, function (err, req, res, data) {
        assert(!err, util.format('Unexpected error starting on POST: %j', err));
        assert(data, 'No data passed from server');
        res.header('content-type').should.be.equal('application/json');
        res.statusCode.should.be.equal(HttpStatus.OK);
        data.should.have.property('post', 'response');
        done();
      });
    }); //it 3.1

    it('3.2 register a POST handler on a path that overrides defaults', function (done) {

      var handler32 = {}, postData = { hello: 'world2' }, responseData = { post: 'response' };

      handler32.post = function (req, res, cb) {
        req.body.should.have.property('hello');
        res.statusCode = HttpStatus.ACCEPTED;
        res.setHeader('content-type', 'text/plain');
        return cb(null, responseData);
      };

      restService3.registerPOSTHandler('/path_ok32', handler32);

      client.post('/baseURL/v1/path_ok32', postData, function (err, req, res, data) {
        assert(!err, util.format('Unexpected error starting on POST: %j', err));
        assert(data, 'No data passed from server');
        res.header('content-type').should.be.equal('text/plain');
        res.statusCode.should.be.equal(HttpStatus.ACCEPTED);
        data.should.have.property('post', 'response');
        done();
      });
    }); //it 3.2
  }); // describe 3

  describe('4 GETJWT handler tests', function () {

    var restService2, client;

    before(function (done) {
      var props = {};
      props.name = 'Test 2';
      props.baseURL = '/baseURL';
      props.URLversion = 'v1';
      props.port = 3103;
      restService2 = restServiceFactory.create(props);

      restService2.start(function (err) {
        assert(!err, util.format('Unexpected error starting service2: %j', err));
        client = restify.createJsonClient({ url: 'http://localhost:' + props.port });
        done();
      });
    });

    it('4.1 register a handler on a path that returns defaults, and GET it', function (done) {

      var handler41 = {}, sendData = { get: 'hello' };

      handler41.get = function (req, res, cb) {
        assert(req, 'No req passed to handler');
        assert(res, 'No res passed to handler');
        return cb(null, sendData);
      };

      restService2.registerGETJWTHandler('/path_41', handler41);

      client.get('/baseURL/v1/path_41', function (err, req, res, data) {
        assert(!err, util.format('Unexpected error starting on GET: %j', err));
        assert(req, 'No req passed from client');
        assert(res, 'No res passed from client');
        assert(data, 'No data passed from server');

        res.statusCode.should.be.equal(HttpStatus.OK);
        res.header('content-type').should.be.equal('text/plain');
        data.should.have.property('get');
        data.should.have.property('get', 'hello');
        done();
      });
    }); //it 4.1

    it('4.2 register a handler on a path that overrides defaults', function (done) {

      var handler42 = {}, sendData = { get: 'hello' };

      handler42.get = function (req, res, cb) {
        assert(req, 'No req passed to handler');
        assert(res, 'No res passed to handler');
        res.statusCode = HttpStatus.ACCEPTED;
        res.setHeader('content-type', 'application/json');
        return cb(null, sendData);
      };

      restService2.registerGETJWTHandler('/path_42', handler42);

      client.get('/baseURL/v1/path_42', function (err, req, res, data) {
        assert(!err, util.format('Unexpected error starting on GET: %j', err));
        assert(req, 'No req passed from client');
        assert(res, 'No res passed from client');
        assert(data, 'No data passed from server');

        res.statusCode.should.be.equal(HttpStatus.ACCEPTED);
        res.header('content-type').should.be.equal('application/json');
        data.should.have.property('get');
        data.should.have.property('get', 'hello');
        done();
      });
    }); //it 4.2
  }); // describe 4

  describe('5 POSTJWT handler tests', function () {

    var restService3, client;

    before(function (done) {
      var props = {};
      props.name = 'Test 5';
      props.baseURL = '/baseURL';
      props.URLversion = 'v1';
      props.port = 3104;
      restService3 = restServiceFactory.create(props);

      // start the service
      restService3.start(function (err) {
        assert(!err, util.format('Unexpected error starting service2: %j', err));

        client = restify.createJsonClient({ url: 'http://localhost:' + props.port });
        done();
      });
    });

    it('5.1 register a POSTJWT handler on a path that returns data and uses default props', function (done) {

      var handler51 = {}, postData = { hello: 'world2' }, responseData = { post: 'response' };

      handler51.post = function (req, res, cb) {
        req.body.should.have.property('hello');
        return cb(null, responseData);
      };

      restService3.registerPOSTJWTHandler('/path_51', handler51);

      client.post('/baseURL/v1/path_51', postData, function (err, req, res, data) {
        assert(!err, util.format('Unexpected error starting on POST: %j', err));
        assert(data, 'No data passed from server');

        //console.log('StatusCode:%d -- headers:%j', res.statusCode, res.headers);
        //console.log('response data string:%j', data);

        res.header('content-type').should.be.equal('text/plain');
        res.statusCode.should.be.equal(HttpStatus.OK);
        data.should.have.property('post', 'response');
        done();
      });
    }); //it 3.1

    it('5.2 register a POST handler on a path that overrides defaults', function (done) {

      var handler52 = {}, postData = { hello: 'world2' }, responseData = { post: 'response' };

      handler52.post = function (req, res, cb) {
        req.body.should.have.property('hello');
        res.statusCode = HttpStatus.ACCEPTED;
        res.setHeader('content-type', 'application/json');
        return cb(null, responseData);
      };

      restService3.registerPOSTJWTHandler('/path_52', handler52);

      client.post('/baseURL/v1/path_52', postData, function (err, req, res, data) {
        assert(!err, util.format('Unexpected error starting on POST: %j', err));
        assert(data, 'No data passed from server');

        //console.log('StatusCode:%d -- headers:%j', res.statusCode, res.headers);
        //console.log('response data string:%j', data);

        res.header('content-type').should.be.equal('application/json');
        res.statusCode.should.be.equal(HttpStatus.ACCEPTED);
        data.should.have.property('post', 'response');
        done();
      });
    }); //it 5.2
  }); // describe 5

  describe('6 Internal API Tests', function () {

    var restService6, props = {};

    before(function (done) {
      props.name = 'Test 2';
      props.baseURL = '/baseURL';
      props.URLversion = 'v1';
      props.port = 3106;

      // setup the api key
      props.internalApiKey = {};
      props.internalApiKey.enabled = '1';
      props.internalApiKey.key = '567';
      props.internalApiKey.name = 'x-pn-hard-coded-api-key';
      restService6 = restServiceFactory.create(props);

      restService6.start(function (err) {
        assert(!err, util.format('Unexpected error starting service2: %j', err));
        done();
      });
    });

    it('6.1 register a handler on a path  response, and GET with no api key should be FORBIDDEN', function (done) {

      var handler61 = {}, sendData = { get: 'hello' }, client, client2;

      handler61.get = function (req, res, cb) {
        assert(req, 'No req passed to handler');
        assert(res, 'No res passed to handler');
        return cb(null, sendData);
      };

      restService6.registerGETHandler('/path_61', handler61);

      client = restify.createJsonClient({ url: 'http://localhost:' + props.port });
      client.get('/baseURL/v1/path_61', function (err, req, res, data) {
        assert(err, util.format('Unexpected error starting on GET: %j', err));
        assert(req, 'No req passed from client');
        assert(res, 'No res passed from client');
        assert(data, 'No data passed from server');

        res.statusCode.should.be.equal(HttpStatus.FORBIDDEN);
        data.should.be.equal('FORBIDDEN');

        // call again with api key and should be ok
        client2 = restify.createJsonClient(
            { url: 'http://localhost:' + props.port,
              headers: { 'x-pn-hard-coded-api-key': '567' } });
        client2.get('/baseURL/v1/path_61', function (err, req, res, data) {
          assert(!err, util.format('Unexpected error starting on GET: %j', err));
          assert(req, 'No req passed from client');
          assert(res, 'No res passed from client');
          assert(data, 'No data passed from server');

          res.statusCode.should.be.equal(HttpStatus.OK);
          done();
        });
      });
    }); //it 6.1

  }); // describe 6

}); // describe
