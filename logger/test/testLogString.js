/*jslint node: true */
const should = require('should');
const loggerFactory = require('../lib/logger');

describe('Test Log String ', function () {
  'use strict';

  let props = { LOG_ENTRIES: false, };
  let logger = loggerFactory.create(props);

  it('should not blow up logging a string', function () {

    let md = { test: 'test-md' };
    let msg = '\njwt1  syndicate\n';
    msg = msg + 'jwt2  subject\n';

    logger.logString('info', 'serviceA', 'JWTs', msg, md);
  });

});
