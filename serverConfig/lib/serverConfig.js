/*jslint node: true, vars: true */

//
//
// A config that wraps
// HOSTNAME
// x_PORT
// x_PROTOCOL
// x_PORT_INSIDE_DOCKER
// MODE
// LOG_ENTRIES
// VERSION
//
var assert = require('assert'),
    LOG_P = require('../../logger/lib/logger').PROPERTIES,
    util = require('util');

//
// Create a new config
// overrides - can be used to overide the process ones
//  .HOSTNAME
//  .PORT
//  .MODE
//  .PORT_INSIDE_DOCKER
//
function create(overrides) {
  'use strict';
  var c = {};

  c.MODE = process.env.MODE;

  //
  // If no mode default to production
  //
  if (!c.MODE) {
    c.MODE = 'PROD';
  }

  if (isProduction(c)) {
    // network config
    c.HOSTNAME = process.env.PROD_HOSTNAME;
    c.PROD_PORT = process.env.PROD_PORT;
    c.PROD_PROTOCOL = process.env.PROD_PROTOCOL;
    c.PROD_PORT_INSIDE_DOCKER = process.env.PROD_PORT_INSIDE_DOCKER;
    c.HOST_TYPE = process.env.PROD_HOST_TYPE;
  } else if (isDevelopment(c)) {
    // network config
    c.HOSTNAME = process.env.DEV_HOSTNAME;
    c.DEV_PORT = process.env.DEV_PORT;
    c.DEV_PROTOCOL = process.env.DEV_PROTOCOL;
    c.DEV_PORT_INSIDE_DOCKER = process.env.DEV_PORT_INSIDE_DOCKER;
    c.HOST_TYPE = process.env.DEV_HOST_TYPE;
  }

  //
  // If overrides has been passed in the set
  //
  if (overrides) {
    if (overrides.MODE) {
      c.MODE = overrides.MODE;
    }

    if (overrides.HOSTNAME) {
      c.HOSTNAME = overrides.HOSTNAME;
    }

    if (overrides.PORT) {
      if (isProduction(c)) {
        c.PROD_PORT = overrides.PORT;
      } else {
        c.DEV_PORT = overrides.PORT;
      }
    }

    if (overrides.PORT_INSIDE_DOCKER) {
      if (isProduction(c)) {
        c.PROD_PORT_INSIDE_DOCKER = overrides.PORT_INSIDE_DOCKER;
      } else {
        c.DEV_PORT_INSIDE_DOCKER = overrides.PORT_INSIDE_DOCKER;
      }
    }
  }

  // by default do not use unless an environmental to override.
  c[LOG_P.useLogEntries] = false;
  if (process.env.LOG_ENTRIES) {
    c[LOG_P.useLogEntries] = process.env.LOG_ENTRIES;
  }

  c.VERSION_NUMBER = 'not-set';
  if (process.env.VERSION_NUMBER) {
    c.VERSION_NUMBER = process.env.VERSION_NUMBER;
  }

  c.getHost = function() {
    return getHost(c);
  };

  c.getHostname = function() {
    return getHostname(c);
  };

  c.getHostnameWithPort = function() {
    return getHostnameWithPort(c);
  };

  c.getPort = function() {
    return getPort(c);
  };

  c.getPortInsideDocker = function() {
    return getPortInsideDocker(c);
  };

  c.getProtocol = function() {
    return getProtocol(c);
  };

  c.isDevelopment = function() {
    return isDevelopment(c);
  };

  c.isProduction = function() {
    return isProduction(c);
  };

  return c;
}

function isDevelopment(c) {
  'use strict';
  assert(c.MODE, util.format('No MODE in config:%j', c));
  return (c.MODE === 'DEV');
}

function isProduction(c) {
  'use strict';
  assert(c.MODE, util.format('No MODE in config:%j', c));
  return (c.MODE === 'PROD');
}

//
// depending on mode return hostname
//
function getHostname(c) {
  'use strict';

  if (c.HOSTNAME) {
    return c.HOSTNAME;
  } else {
    return 'localhost';
  }
}

//
// Depending on mode return the port
//
function getPortInsideDocker(c) {
  'use strict';
  var portInsideDocker = 8080;

  if (isProduction(c) && c.PROD_PORT_INSIDE_DOCKER) {
    portInsideDocker = c.PROD_PORT_INSIDE_DOCKER;
  } else if (isDevelopment(c) && c.DEV_PORT_INSIDE_DOCKER) {
    portInsideDocker = c.DEV_PORT_INSIDE_DOCKER;
  }

  return portInsideDocker;
}

//
// Depending on mode return the port
//
function getPort(c) {
  'use strict';
  var port = 8080;

  if (isProduction(c) && c.PROD_PORT) {
    port = c.PROD_PORT;
  } else if (isDevelopment(c) && c.DEV_PORT) {
    port = c.DEV_PORT;
  }

  return port;
}

//
// Depending on mode return the protocol
//
function getProtocol(c) {
  'use strict';
  var protocol = 'http';

  if (isProduction(c) && c.PROD_PROTOCOL) {
    protocol = c.PROD_PROTOCOL;
  } else if (isDevelopment(c) && c.DEV_PROTOCOL) {
    protocol = c.DEV_PROTOCOL;
  }

  return protocol;
}

//
// Depending on mode return the combination of hostname and port
//
function getHostnameWithPort(c) {
  'use strict';
  var result = 'localhost:8080';

  if (isProduction(c)) {
    result = getHostname(c);
    if (c.PROD_PORT) {
      result = result + ':' + c.PROD_PORT;
    }
  } else if (isDevelopment(c)) {
    result = getHostname(c);
    if (c.DEV_PORT) {
      result = result + ':' + c.DEV_PORT;
    }
  }

  return result;
}

//
// returns combination of protocol, hostname and port
//
function getHost(c) {
  'use strict';
  return getProtocol(c) + '://' + getHostnameWithPort(c);
}

module.exports = {
  create: create
  /*getHost: getHost,
  getHostname: getHostname,
  getHostnameWithPort: getHostnameWithPort,
  getPort: getPort,
  getPortInsideDocker: getPortInsideDocker,
  getProtocol: getProtocol,
  getServiceConfig: getServiceConfig,
  isDevelopment: isDevelopment,
  isProduction: isProduction*/
};
