/*jslint node: true, vars: true */

const assert = require('assert');
const configFactory = require('../lib/configFactory');
const fs = require('fs');
const should = require('should');
const yaml = require('js-yaml');

function createCanonConfigFile() {
  'use strict';
  return {
    version: 1,
    a_service_name: {
      DOMAIN_NAME: 'test.com',
      LISTEN_PORT: '8081',
      LISTEN_PORT_INSIDE_DOCKER: '8082',
      terminate_tls: {
        enabled: true,
        certificate_file: '../test/test-data/fake_file',
        private_key_file: '../test/test-data/fake_file1',
      },
      jwt: {
        signer: {
          alg: 'RS256',
          RS256: {
            certificate_file: '../test/test-data/fake_file1',
            public_key_file: '../test/test-data/fake_file1',
            private_key_file: '../test/test-data/fake_file1',
          },
        },
        verifier: {
          enabled: true,
          HS256: {
            secret: 'yes',
          },
        },
      },
    },
  };
}

describe('1 config file tests', function () {
  'use strict';

  it('1.1 should verify and return config if all props are valid', function () {

    let cf = createCanonConfigFile().a_service_name;
    let c = configFactory.create(cf);
    assert(c, 'No config returned from create');
    commonVerifyValid(c, cf);
  });
}); // describe 1

describe('2 read YAML config file', function () {
  'use strict';

  it('2.1 should verify and return config if all props are valid', function () {

    let yamlConfig = fs.readFileSync(__dirname + '/' + './test-data/config_test1.yaml').toString(); //console.log(yamlConfig);

    let cf = yaml.safeLoad(yamlConfig); // create own copy so can checks that fields were set correctly
    //console.log('safeload yaml', cf);

    let c = configFactory.createFromYAML(yamlConfig, 'service_1');
    assert(c, 'No config returned from create');
    console.log(c);

    commonVerifyValid(c, cf.service_1);
  });
}); // describe 2

describe('3 test verifier',  function () {
  'use strict';

  it('1.1 should be able to pass in verifier function, if all ok then returns config', function () {

    let verifier = function (config) {
      assert(config, 'no config file passed in');
    };

    let cf = createCanonConfigFile().a_service_name;
    let c = configFactory.create(cf, verifier);
    assert(c, 'No config returned from create');
    commonVerifyValid(c, cf);
  });
}); // describe 3

//
// HELPER UTILS
//

function commonVerifyValid(c, cf) {
  'use strict';

  assert(c, 'No config returned from create');

  c.should.have.property('DOMAIN_NAME', cf.DOMAIN_NAME);
  c.should.have.property('LISTEN_PORT', cf.LISTEN_PORT);
  c.should.have.property('LISTEN_PORT_INSIDE_DOCKER', cf.LISTEN_PORT_INSIDE_DOCKER);

  c.should.have.property('terminate_tls');
  c.terminate_tls.should.have.property('enabled', true);
  c.terminate_tls.should.have.property('certificate_file', cf.terminate_tls.certificate_file);
  c.terminate_tls.should.have.property('private_key_file', cf.terminate_tls.private_key_file);
  c.should.have.property('PROTOCOL', 'https');

  c.should.have.property('crypto');
  c.crypto.should.have.property('jwt');
  c.crypto.jwt.should.have.property('issuer', cf.DOMAIN_NAME);
  c.crypto.jwt.should.have.property('type', cf.jwt.signer.alg);
  c.crypto.jwt.should.have.property('x509CertPEM', '1\n');
  c.crypto.jwt.should.have.property('publicKeyPEM', '1\n');
  c.crypto.jwt.should.have.property('privateKey', '1\n');
  c.crypto.jwt.should.have.property('secret', 'yes');
  c.should.have.property('VERIFY_JWT', true);
}
