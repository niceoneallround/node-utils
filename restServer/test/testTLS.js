/*jslint node: true, vars: true */
const assert = require('assert');
const fs = require('fs');
const HttpStatus = require('http-status');
const request = require('request');
const restServiceFactory = require('../lib/restServer');
const should = require('should');
const util = require('util');

describe('1 Test can configure to start with TLS', function () {
  'use strict';

  let restService;
  let props = {};
  props.name = 'Test TLS';
  props.baseURL = '/baseURL';
  props.URLversion = 'v1';
  props.port = 3107;
  props.TLSEnabled = '1';
  props.certificate = __dirname + '/' + 'rsa.x509crt';
  props.key = __dirname + '/' + 'rsa-private.pem';
  props.httpsServerOptions = {};

  console.log(props);

  before(function (done) {
    restService = restServiceFactory.create(props);
    restService.start(function (err) {
      assert(!err, util.format('Unexpected error starting service2: %j', err));
      done();
    });
  });

  after(function (done) {
    restService.stop(function (err) {
      assert(!err, util.format('Unexpected error stopping service: %j', err));
      done();
    });
  });

  it('7.1 should be all get on HTTPS', function (done) {

    let handler71 = {};
    let sendData = { get: 'hello' };

    // use HTTPS
    let uri = 'https://localhost:' + props.port + '/baseURL/v1/path_71';

    handler71.get = function (req, res, cb) {
      assert(req, 'No req passed to handler');
      assert(res, 'No res passed to handler');
      return cb(null, sendData);
    };

    restService.registerGETHandler('/path_71', handler71);

    request(
      { method: 'GET',
        uri: uri,
        json: true,
        ca: [fs.readFileSync(props.certificate)], // as self signed pass my cert as the CA cert to use :)
        checkServerIdentity: function (host, cert) {
                                // this is the certificate returned by the Server
                                // called so can check if hostname matches names in the certificate,
                                // if remove node will check and barf, as servers host name 'local host' does not match
                                // the names in the cert.
                                //
                                console.log('***** host:%j cert:%j', host, cert);
                                console.log('****SUBJECT CN:%s', cert.subject.CN);
                                console.log('****ISSUER CN:%s', cert.issuer.CN);

                                // check certificate is as expected
                                cert.subject.CN.should.be.equal('bogus.server.test.webshield.io');
                                cert.issuer.CN.should.be.equal('bogus.server.test.webshield.io');
                                return; // returns undefined if all ok, otherwise throw and error
                              },

        //rejectUnauthorized: false,
      },
      function (err, res, body) {
        assert(!err, util.format('should not have been an error:%s', err));
        res.statusCode.should.be.equal(HttpStatus.OK);
        res.header('content-type').should.be.equal('application/json');
        body.should.have.property('get', 'hello');
        done();
      }
    );
  }); //it 7.1

}); // describe 7
