/*jslint node: true, vars: true */

var assert = require('assert'),
    configUtils = require('../lib/serverConfig'),
    should = require('should'),
    util = require('util');

describe('Server Config Utils Tests', function () {
  'use strict';

  it('0.1 it should return a configuration', function () {

    var c = configUtils.create();
    assert(c, 'No config returned from create');
  });

  describe('1 test production versus dev flags', function () {
    it('1.1 it should support isProduction', function () {

      var c = configUtils.create();

      assert(c, 'No config returned!');

      c.MODE = 'PROD';
      c.isProduction().should.be.equal(true);

      c.MODE = 'DEV';
      c.isProduction().should.be.equal(false);
    });

    it('1.2 it should support isDevelopment', function () {

      var c = configUtils.create();

      c.MODE = 'DEV';
      c.isDevelopment().should.be.equal(true);

      c.MODE = 'PROD';
      c.isDevelopment().should.be.equal(false);
    });
  });

  describe('2 test getHostnameWithPort', function () {
    it('2.1 it should work with PROD and hostname', function () {

      var c = configUtils.create();

      c.MODE = 'PROD';
      c.HOSTNAME = 'hell_yea';
      c.getHostnameWithPort().should.be.equal('hell_yea');

      c.PROD_PORT = '666';
      c.getHostnameWithPort().should.be.equal('hell_yea:666');

    });

    it('2.2 it should work with DEV and hostname', function () {

      var c = configUtils.create();

      c.MODE = 'DEV';
      c.HOSTNAME = 'hell_no';
      c.getHostnameWithPort().should.be.equal('hell_no');

      c.DEV_PORT = '999';
      c.getHostnameWithPort().should.be.equal('hell_no:999');

    });

    it('2.2 it should work with no hostname', function () {

      var c = configUtils.create();

      c.MODE = 'DEV';
      c.getHostnameWithPort().should.be.equal('localhost');

      c.DEV_PORT = '999';
      c.getHostnameWithPort().should.be.equal('localhost:999');

    });
  });

  describe('3 test getHostname', function () {
    it('it should work with PROD', function () {

      var c = configUtils.create();

      c.MODE = 'PROD';
      c.HOSTNAME = 'hell_yea';
      c.getHostname().should.be.equal('hell_yea');
    });

    it('3.1 it should work with DEV', function () {

      var c = configUtils.create();

      c.MODE = 'DEV';
      c.HOSTNAME = 'hell_no';
      c.getHostname().should.be.equal('hell_no');

    });

    it('3.2 it should work with no hostname', function () {

      var c = configUtils.create();

      c.MODE = 'DEV';
      c.getHostnameWithPort().should.be.equal('localhost');
    });
  });

  describe('4 test getPort', function () {
    it('it should work with PROD and port', function () {

      var c = configUtils.create();

      c.MODE = 'PROD';
      c.PROD_PORT = '666';
      c.getPort().should.be.equal('666');
    });

    it('4.1 it should work with DEV and hostname', function () {

      var c = configUtils.create();

      c.MODE = 'DEV';
      c.DEV_PORT = '999';
      c.getPort().should.be.equal('999');
    });
  });

  describe('5 test getPortInsideDocker', function () {
    it('5.1 it should work with PROD and port', function () {

      var c = configUtils.create();

      c.MODE = 'PROD';
      c.PROD_PORT_INSIDE_DOCKER = '666';
      c.getPortInsideDocker().should.be.equal('666');
    });

    it('5.2 it should work with DEV and hostname', function () {

      var c = configUtils.create();

      c.MODE = 'DEV';
      c.DEV_PORT_INSIDE_DOCKER = '999';
      c.getPortInsideDocker().should.be.equal('999');
    });
  });

  describe('6 test getProtocol', function () {
    it('6.1 it should work with PROD and protocol', function () {

      var c = configUtils.create();

      c.MODE = 'PROD';
      c.PROD_PROTOCOL = 'http_1';
      c.getProtocol().should.be.equal('http_1');
    });

    it('6.2 it should work with DEV and protocol', function () {

      var c = configUtils.create();

      c.MODE = 'DEV';
      c.DEV_PROTOCOL = 'http_2';
      c.getProtocol().should.be.equal('http_2');
    });

    it('6.3 it should default to http if dev mode', function () {

      var c = configUtils.create();

      c.MODE = 'DEV';
      c.getProtocol().should.be.equal('http');
    });

    it('6.4 it should default to http if prod mode', function () {

      var c = configUtils.create();

      c.MODE = 'PROD';
      c.getProtocol().should.be.equal('http');
    });
  });

  describe('7 test log entries', function () {

    it('7.1 it should be false by default', function () {
      var c = configUtils.create();
      assert(!c.LOG_ENTRIES, util.format('Log entries by default should be false:%j', c));
    });

    it('7.2 it should pick up from env ', function () {
      var c;

      process.env.LOG_ENTRIES = true;
      process.env.LOG_ENTRIES_TOKEN = '23';
      c = configUtils.create();
      assert(c.LOG_ENTRIES, util.format('Log entries should be true:%j', c));
      c.should.have.property('LOG_ENTRIES_TOKEN', '23');
    });
  });

  describe('8 test VERSION_NUMBER', function () {

    it('8.1 it should be false by default', function () {
      var c = configUtils.create();
      assert((c.VERSION_NUMBER === 'not-set'), util.format('Version number not set to not set :):%j', c));
    });

    it('8.2 it should pick up from env ', function () {
      var c;

      process.env.VERSION_NUMBER = '1.0.23';
      c = configUtils.create();
      assert((c.VERSION_NUMBER === '1.0.23'), util.format('Version number not set to not set :):%j', c));
    });
  });

  describe('9 test getHost', function () {

    it('9.1 it should work with PROD', function () {

      var c = configUtils.create();
      c.MODE = 'PROD';
      c.HOSTNAME = 'hell_yea';
      c.PROD_PORT = '23';
      c.PROD_PROTOCOL = 'http';
      c.getHost().should.be.equal('http://hell_yea:23');
    });
  });

  describe('10 test overrides', function () {

    it('10.1 it should work with PROD', function () {

      var c, overrides;

      overrides = {};
      overrides.MODE = 'DEV';
      overrides.HOSTNAME = 'override_yea';
      overrides.PORT = '23';
      c = configUtils.create(overrides);
      c.getHost().should.be.equal('http://override_yea:23');
    });
  });

  describe('11 test crypto params', function () {
    it('11.1 check defaults are good', function () {
      var c, overrides;

      overrides = {};
      overrides.HOSTNAME = 'override_yea';
      overrides.crypto = {};
      overrides.crypto.jwt = {};
      overrides.crypto.jwt.JWT_SECRET = 'a_secret';
      c = configUtils.create(overrides);
      c.should.have.property('crypto');
      c.crypto.should.have.property('jwt');
      c.crypto.jwt.should.have.property('issuer', overrides.HOSTNAME);
      c.crypto.jwt.should.have.property('secret', 'a_secret');
    });
  });

  describe('12 test TLS params', function () {

    it('12.1 check overrides work', function () {
      var c, overrides = {};
      overrides.SERVER_TLS_CERT_FILE = 'override1';
      overrides.SERVER_TLS_ENCODED_KEY_FILE = 'override2';
      overrides.AWS_KMS_REGION = 'override3';
      c = configUtils.create(overrides);
      c.should.have.property('SERVER_TLS_CERT_FILE', 'override1');
      c.should.have.property('SERVER_TLS_ENCODED_KEY_FILE', 'override2');
      c.should.have.property('AWS_KMS_REGION', 'override3');
      c.should.have.property('INBOUND_TLS_ON');
      c.should.have.property('OUTBOUND_TLS_ON');
    });
  });

  describe('13 test METADATA_SERVICE_URL', function () {
    it('13.1 check overrides work', function () {
      var c, overrides = {};

      overrides.METADATA_SERVICE_URL = 'override1';
      c = configUtils.create(overrides);
      c.should.have.property('METADATA_SERVICE_URL', 'override1');
    });
  });

  describe('14 test PRIVACY_BROKER_URL', function () {
    it('14.1 check overrides work', function () {
      var c, overrides = {};

      overrides.PRIVACY_BROKER_URL = 'override1';
      c = configUtils.create(overrides);
      c.should.have.property('PRIVACY_BROKER_URL', 'override1');
    });
  });

  describe('15 test REFERENCE_SOURCE_PROXY_URL', function () {
    it('15.1 check overrides work', function () {
      var c, overrides = {};

      overrides.REFERENCE_SOURCE_PROXY_URL = 'override1';
      c = configUtils.create(overrides);
      c.should.have.property('REFERENCE_SOURCE_PROXY_URL', 'override1');
    });
  });

  describe('16 test REFERENCE_SOURCE_POST_SUBJECT_QUERY_URL', function () {
    it('16.1 check overrides work', function () {
      var c, overrides = {};

      overrides.REFERENCE_SOURCE_POST_SUBJECT_QUERY_URL = 'override1';
      c = configUtils.create(overrides);
      c.should.have.property('REFERENCE_SOURCE_POST_SUBJECT_QUERY_URL', 'override1');
    });
  });

  describe('17 test DOMAIN_NAME', function () {
    it('17.1 check overrides work', function () {
      var c, overrides = {};

      overrides.DOMAIN_NAME = 'override1';
      c = configUtils.create(overrides);
      c.should.have.property('DOMAIN_NAME', 'override1');
    });
  });

  describe('18 test PRIVACY_NODE_URL', function () {
    it('18.1 check overrides work', function () {
      var c, overrides = {};

      overrides.PRIVACY_NODE_URL = 'override1';
      c = configUtils.create(overrides);
      c.should.have.property('PRIVACY_NODE_URL', 'override1');
    });
  });

  describe('18 test API_GATEWAY_URL', function () {
    it('18.1 check overrides work', function () {
      var c, overrides = {};

      overrides.API_GATEWAY_URL = 'override1';
      c = configUtils.create(overrides);
      c.should.have.property('API_GATEWAY_URL', 'override1');
    });
  });

  describe('19 test IDENTITY_SYNDICATE_URL', function () {
    it('19.1 check overrides work', function () {
      var c, overrides = {};

      overrides.IDENTITY_SYNDICATE_URL = 'override1';
      c = configUtils.create(overrides);
      c.should.have.property('IDENTITY_SYNDICATE_URL', 'override1');
    });
  });

  describe('20 test REFERENCE_SOURCE_POST_BACK_QUERY_RESULTS_URL', function () {
    it('20.1 check overrides work', function () {
      var c, overrides = {};

      overrides.REFERENCE_SOURCE_POST_BACK_QUERY_RESULTS_URL = 'override1';
      c = configUtils.create(overrides);
      c.should.have.property('REFERENCE_SOURCE_POST_BACK_QUERY_RESULTS_URL', 'override1');
    });
  });

});
