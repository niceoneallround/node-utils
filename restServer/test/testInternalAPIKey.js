/*jslint node: true, vars: true */
const assert = require('assert');
const HttpStatus = require('http-status');
const loggerFactory = require('../../logger/lib/logger');
const request = require('request');
const restServiceFactory = require('../lib/restServer');
const should = require('should');
const util = require('util');

describe('RestServer Internal API KEY Tests', function () {
  'use strict';

  const API_KEY = '567';

  let restService6;
  let props = {};
  props.name = 'Test 2';
  props.baseURL = '/baseURL';
  props.URLversion = 'v1';
  props.port = 3106;
  props.logger = loggerFactory.create(null);

  before(function (done) {

    // setup the api key
    props.config = {
      internal_api_key: {
        enabled: true,
        key: API_KEY,
      }
    };

    restService6 = restServiceFactory.create(props);

    restService6.start(function (err) {
      assert(!err, util.format('Unexpected error starting service2: %j', err));
      done();
    });
  });

  after(function (done) {
    restService6.stop(function (err) {
      console.log('STOPPPPPING');
      assert(!err, util.format('Unexpected error stopping service: %j', err));
      done();
    });
  });

  it('1.1 should return FORBIDDEN if call path with no API key - server started with APIKey', function (done) {

    let handler11 = {};
    let sendData = { get: 'hello' };
    let uri = 'http://localhost:' + props.port + '/baseURL/v1/path_11';

    handler11.get = function (req, res, cb) {
      assert(req, 'No req passed to handler');
      assert(res, 'No res passed to handler');
      return cb(null, sendData);
    };

    restService6.registerGETHandler('/path_11', handler11);

    request(
      { method: 'GET',
        uri: uri,
        json: true,
      },
      function (err, res, body) {
        assert(!err, util.format('should not have been an error:%s', err));
        res.statusCode.should.be.equal(HttpStatus.FORBIDDEN);
        res.header('content-type').should.be.equal('text/plain');
        body.should.be.equal('FORBIDDEN');
        done();
      }
    );
  }); //it 6.1

  it('1.2 should return OK if call path with API key - server started with APIKey', function (done) {

    let handler12 = {};
    let sendData = { get: 'hello' };
    let uri = 'http://localhost:' + props.port + '/baseURL/v1/path_12';

    handler12.get = function (req, res, cb) {
      assert(req, 'No req passed to handler');
      assert(res, 'No res passed to handler');
      return cb(null, sendData);
    };

    restService6.registerGETHandler('/path_12', handler12);

    request(
      { method: 'GET',
        uri: uri,
        json: true,
        headers: {
          'x-webshield-io-internal-api-key': API_KEY,
        }
      },
      function (err, res, body) {
        assert(!err, util.format('should not have been an error:%s', err));
        res.statusCode.should.be.equal(HttpStatus.OK);
        res.header('content-type').should.be.equal('application/json');
        body.should.have.property('get', 'hello');
        done();
      }
    );
  }); //it 6.2

}); // describe 6
