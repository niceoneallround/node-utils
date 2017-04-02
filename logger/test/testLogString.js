/*jslint node: true */
const should = require('should');
const loggerFactory = require('../lib/logger');

describe('Test Log String ', function () {
  'use strict';

  let props = { LOG_ENTRIES: false, };
  let logger = loggerFactory.create(props);

  it('should not blow up logging a string', function () {

    let md = { test: 'test-md' };
    let info = { serviceName: 'sname', action: 'action1', };

    let strings = [];
    strings.push('jwt1  syndicate');
    strings.push('jwt2  subject');
    logger.logStrings('info', info, strings, md);
  });

});
