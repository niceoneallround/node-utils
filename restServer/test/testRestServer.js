/*jslint node: true, vars: true */
const assert = require('assert');
const loggerFactory = require('../../logger/lib/logger');
const HttpStatus = require('http-status');
const request = require('request');
const restServiceFactory = require('../lib/restServer');
const should = require('should');
const util = require('util');

describe('1 restServer mgmt tests', function () {
  'use strict';

  it('1.1 should be able to stop the service', function (done) {

    //create a server to stop
    let props = {
      name: 'Test 11',
      baseURL: '/baseURL',
      URLversion: 'v1',
      port: 3201 };

    let restServer2Stop = restServiceFactory.create(props);

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

    //create a server to stop
    let props = {
      name: 'Test 11',
      baseURL: '/baseURL',
      logger: loggerFactory.create(null),
      URLversion: 'v1',
      port: 3202 };

    let restService2 = restServiceFactory.create(props);

    restService2.logger().should.be.equal(props.logger);
    done();

  }); //it 1.2

}); // describe 1

describe('2 restServer GET handler tests', function () {
  'use strict';

  let restService2;
  let props = {};
  props.name = 'Test 2';
  props.baseURL = '/baseURL';
  props.URLversion = 'v1';
  props.port = 3101;

  before(function (done) {
    restService2 = restServiceFactory.create(props);
    restService2.start(function (err) {
      assert(!err, util.format('Unexpected error starting service2: %j', err));
      done();
    });
  });

  after(function (done) {
    restService2.stop(function (err) {
      assert(!err, util.format('Unexpected error stopping service: %j', err));
      done();
    });
  });

  it('2.1 register a handler on a path that returns 200 response, and GET it', function (done) {

    let handler21 = {};
    let sendData = { get: 'hello' };
    let uri = 'http://localhost:' + props.port + '/baseURL/v1/path_21';

    handler21.get = function (req, res, cb) {
      assert(req, 'No req passed to handler');
      assert(res, 'No res passed to handler');
      return cb(null, sendData);
    };

    restService2.registerGETHandler('/path_21', handler21);

    request(
      { method: 'GET',
        uri: uri,
        json: true,
      },
      function (err, res, body) {
        assert(!err, util.format('should not have been an error:%s', err));
        res.statusCode.should.be.equal(HttpStatus.OK);
        res.header('content-type').should.be.equal('application/json');
        body.should.have.property('get', 'hello');
        done();
      }
    );
  }); //it 2.1

  it('2.2 register a handler on a path that returns text/plain and GET it', function (done) {

    let handler22 = {};
    let sendData = 'hello';
    let uri = 'http://localhost:' + props.port + '/baseURL/v1/path_22';

    handler22.get = function (req, res, cb) {
      assert(req, 'No req passed to handler');
      assert(res, 'No res passed to handler');
      res.setHeader('content-type', 'text/plain');
      return cb(null, sendData);
    };

    restService2.registerGETHandler('/path_22', handler22);

    request(
      { method: 'GET',
        uri: uri
      },
      function (err, res, body) {
        assert(!err, util.format('should not have been an error:%s', err));
        res.statusCode.should.be.equal(HttpStatus.OK);
        res.header('content-type').should.be.equal('text/plain');
        body.should.be.equal('hello');
        console.log(body);
        done();
      }
    );
  }); //it 2.2
}); // describe 2

describe('3 restServer POST handler tests', function () {
  'use strict';

  let restService3;
  let props = {};
  props.name = 'Test 3';
  props.baseURL = '/baseURL';
  props.URLversion = 'v1';
  props.port = 3102;

  before(function (done) {
    restService3 = restServiceFactory.create(props);

    // start the service
    restService3.start(function (err) {
      assert(!err, util.format('Unexpected error starting service2: %j', err));
      done();
    });
  });

  after(function (done) {
    restService3.stop(function (err) {
      assert(!err, util.format('Unexpected error stopping service: %j', err));
      done();
    });
  });

  it('3.1 register a POST handler on a path by default should return OK and application/json', function (done) {

    let handler31 = {};
    let postData = { hello: 'world2' };
    let responseData = { back2U: 'response' };
    let uri = 'http://localhost:' + props.port + '/baseURL/v1/path_ok31';

    handler31.post = function (req, res, cb) {
      req.body.should.have.property('hello');
      return cb(null, responseData);
    };

    restService3.registerPOSTHandler('/path_ok31', handler31);

    request(
      { method: 'POST',
        uri: uri,
        json: true,
        body: postData
      },
      function (err, res, body) {
        assert(!err, util.format('should not have been an error:%s', err));
        res.statusCode.should.be.equal(HttpStatus.OK);
        res.header('content-type').should.be.equal('application/json');
        body.should.have.property('back2U', 'response');
        done();
      }
    );
  }); //it 3.1

  it('3.2 register a POST handler on a path that overrides to return ACCEPTED and text/plain', function (done) {

    let handler32 = {};
    let postData = { hello: 'world2' };
    let responseData = 'test-string';
    let uri = 'http://localhost:' + props.port + '/baseURL/v1/path_ok32';

    handler32.post = function (req, res, cb) {
      req.body.should.have.property('hello');
      res.statusCode = HttpStatus.ACCEPTED;
      res.setHeader('content-type', 'text/plain');
      return cb(null, responseData);
    };

    restService3.registerPOSTHandler('/path_ok32', handler32);

    request(
      { method: 'POST',
        uri: uri,
        json: true,
        body: postData
      },
      function (err, res, body) {
        assert(!err, util.format('should not have been an error:%s', err));
        res.statusCode.should.be.equal(HttpStatus.ACCEPTED);
        res.header('content-type').should.be.equal('text/plain');
        body.should.be.equal(responseData);
        done();
      }
    );
  }); //it 3.2
}); // describe 3

describe('4 restServer GETJWT handler tests', function () {
  'use strict';

  let restService2;
  let props = {};
  props.name = 'Test 2';
  props.baseURL = '/baseURL';
  props.URLversion = 'v1';
  props.port = 3103;

  before(function (done) {
    var props = {};
    props.name = 'Test 2';
    props.baseURL = '/baseURL';
    props.URLversion = 'v1';
    props.port = 3103;
    restService2 = restServiceFactory.create(props);

    restService2.start(function (err) {
      assert(!err, util.format('Unexpected error starting service2: %j', err));
      done();
    });
  });

  after(function (done) {
    restService2.stop(function (err) {
      assert(!err, util.format('Unexpected error stopping service: %j', err));
      done();
    });
  });

  it('4.1 should be able register a GET JWT handler on a path and if called get back OK and text/plain', function (done) {

    let handler41 = {};
    let responseData = 'hello';
    let uri = 'http://localhost:' + props.port + '/baseURL/v1/path_41';

    handler41.get = function (req, res, cb) {
      assert(req, 'No req passed to handler');
      assert(res, 'No res passed to handler');
      return cb(null, responseData);
    };

    restService2.registerGETJWTHandler('/path_41', handler41);

    request(
      { method: 'GET',
        uri: uri
      },
      function (err, res, body) {
        assert(!err, util.format('should not have been an error:%s', err));
        res.statusCode.should.be.equal(HttpStatus.OK);
        res.header('content-type').should.be.equal('text/plain');
        body.should.be.equal('hello');
        console.log(body);
        done();
      }
    );
  }); //it 4.1

  it('4.2 should be able register a GET JWT handler on a path and if called overrides default status and content type', function (done) {

    let handler42 = {};
    let responseData = { get: 'hello' };
    let uri = 'http://localhost:' + props.port + '/baseURL/v1/path_42';

    handler42.get = function (req, res, cb) {
      assert(req, 'No req passed to handler');
      assert(res, 'No res passed to handler');
      res.statusCode = HttpStatus.ACCEPTED;
      res.setHeader('content-type', 'application/json');
      return cb(null, responseData);
    };

    restService2.registerGETJWTHandler('/path_42', handler42);

    request(
      { method: 'GET',
        uri: uri,
        json: true
      },
      function (err, res, body) {
        assert(!err, util.format('should not have been an error:%s', err));
        res.statusCode.should.be.equal(HttpStatus.ACCEPTED);
        res.header('content-type').should.be.equal('application/json');
        body.should.have.property('get', 'hello');
        done();
      }
    );

  }); //it 4.2
}); // describe 4

describe('5 restServer POSTJWT handler tests', function () {
  'use strict';

  let restService3;
  let props = {};
  props.name = 'Test 5';
  props.baseURL = '/baseURL';
  props.URLversion = 'v1';
  props.port = 3104;

  before(function (done) {
    restService3 = restServiceFactory.create(props);
    restService3.start(function (err) {
      assert(!err, util.format('Unexpected error starting service2: %j', err));
      done();
    });
  });

  after(function (done) {
    restService3.stop(function (err) {
      assert(!err, util.format('Unexpected error stopping service: %j', err));
      done();
    });
  });

  it('5.1 register a POSTJWT handler on a path that returns data and uses default status and content-type', function (done) {

    let handler51 = {};
    let postData = 'jwt1';
    let responseData = 'jwt2';
    let uri = 'http://localhost:' + props.port + '/baseURL/v1/path_51';

    handler51.post = function (req, res, cb) {
      req.headers['content-type'].should.be.equal('text/plain');
      req.body.should.be.equal(postData);
      return cb(null, responseData);
    };

    restService3.registerPOSTJWTHandler('/path_51', handler51);

    request(
      { method: 'POST',
        uri: uri,
        body: postData,
        headers: {
          'content-type': 'text/plain',
        }
      },
      function (err, res, body) {
        assert(!err, util.format('should not have been an error:%s', err));
        res.statusCode.should.be.equal(HttpStatus.OK);
        res.header('content-type').should.be.equal('text/plain');
        body.should.be.equal(responseData);
        done();
      }
    );
  }); //it 3.1

  it('5.2 register a POSTJWT handler that overrides defaults OK and text/plain - i.e. returns an error', function (done) {

    let handler52 = {};
    let postData = 'jwt1';
    let responseData = { error: '1' };
    let uri = 'http://localhost:' + props.port + '/baseURL/v1/path_52';

    handler52.post = function (req, res, cb) {
      req.headers['content-type'].should.be.equal('text/plain');
      req.body.should.be.equal(postData);
      res.statusCode = HttpStatus.ACCEPTED;
      res.setHeader('content-type', 'application/json');
      return cb(null, responseData);
    };

    restService3.registerPOSTJWTHandler('/path_52', handler52);

    request(
      { method: 'POST',
        uri: uri,
        body: postData,
        headers: {
          'content-type': 'text/plain',
        }
      },
      function (err, res, body) {
        assert(!err, util.format('should not have been an error:%s', err));
        res.statusCode.should.be.equal(HttpStatus.ACCEPTED);
        res.header('content-type').should.be.equal('application/json');
        let json = JSON.parse(body);
        json.should.have.property('error', '1');
        done();
      }
    );
  }); //it 5.2

  it('5.3 register a POSTJWT handler that overrides defaults OK and text/plain - i.e. returns an error', function (done) {

    let handler52 = {};
    let postData = 'jwt1';
    let responseData = { error: '1' };
    let uri = 'http://localhost:' + props.port + '/baseURL/v1/path_52';

    handler52.post = function (req, res, cb) {
      // note typo upper case is meant to be
      req.headers['Content-type'].should.be.equal('text/plain');
      req.body.should.be.equal(postData);
      res.statusCode = HttpStatus.ACCEPTED;
      res.setHeader('content-type', 'application/json');
      return cb(null, responseData);
    };

    restService3.registerPOSTJWTHandler('/path_52', handler52);

    request(
      { method: 'POST',
        uri: uri,
        body: postData,
        headers: {
          'content-type': 'text/plain',
        }
      },
      function (err, res, body) {
        assert(!err, util.format('should not have been an error:%s', err));
        res.statusCode.should.be.equal(HttpStatus.ACCEPTED);
        res.header('content-type').should.be.equal('application/json');
        let json = JSON.parse(body);
        json.should.have.property('error', '1');
        done();
      }
    );
  }); //it 5.3
}); // describe 5
