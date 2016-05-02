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
  var c = {}, tmp;

  c.MODE = process.env.MODE;
  c.passedInOverrides = overrides;

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
  c.LOG_ENTRIES = false;
  if (process.env.LOG_ENTRIES) {
    tmp = process.env.LOG_ENTRIES;
    if (tmp.toLowerCase() === 'true') {
      c.LOG_ENTRIES = true;
      c.LOG_ENTRIES_TOKEN = process.env.LOG_ENTRIES_TOKEN;
    }
  }

  c.VERSION_NUMBER = 'not-set';
  if (process.env.VERSION_NUMBER) {
    c.VERSION_NUMBER = process.env.VERSION_NUMBER;
  }

  // audit info - should be in the dataset metadata or other but for now use and env as easier
  c.AUDIT_URL = 'not-set';
  if (process.env.AUDIT_URL) {
    c.AUDIT_URL = process.env.AUDIT_URL;
  }

  c.METADATA_SERVICE_URL = 'not-set';
  if ((overrides) && (overrides.METADATA_SERVICE_URL)) {
    c.METADATA_SERVICE_URL = overrides.METADATA_SERVICE_URL;
  } else if (process.env.METADATA_SERVICE_URL) {
    c.METADATA_SERVICE_URL = process.env.METADATA_SERVICE_URL;
  }

  c.PRIVACY_BROKER_URL = 'not-set';
  if ((overrides) && (overrides.PRIVACY_BROKER_URL)) {
    c.PRIVACY_BROKER_URL = overrides.PRIVACY_BROKER_URL;
  } else if (process.env.PRIVACY_BROKER_URL) {
    c.PRIVACY_BROKER_URL = process.env.PRIVACY_BROKER_URL;
  }

  c.PRIVACY_NODE_URL = 'not-set';
  if ((overrides) && (overrides.PRIVACY_NODE_URL)) {
    c.PRIVACY_NODE_URL = overrides.PRIVACY_NODE_URL;
  } else if (process.env.PRIVACY_NODE_URL) {
    c.PRIVACY_NODE_URL = process.env.PRIVACY_NODE_URL;
  }

  c.REFERENCE_SOURCE_PROXY_URL = 'not-set';
  if ((overrides) && (overrides.REFERENCE_SOURCE_PROXY_URL)) {
    c.REFERENCE_SOURCE_PROXY_URL = overrides.REFERENCE_SOURCE_PROXY_URL;
  } else if (process.env.REFERENCE_SOURCE_PROXY_URL) {
    c.REFERENCE_SOURCE_PROXY_URL = process.env.REFERENCE_SOURCE_PROXY_URL;
  }

  c.REFERENCE_SOURCE_POST_SUBJECT_QUERY_URL = 'not-set';
  if ((overrides) && (overrides.REFERENCE_SOURCE_POST_SUBJECT_QUERY_URL)) {
    c.REFERENCE_SOURCE_POST_SUBJECT_QUERY_URL = overrides.REFERENCE_SOURCE_POST_SUBJECT_QUERY_URL;
  } else if (process.env.REFERENCE_SOURCE_POST_SUBJECT_QUERY_URL) {
    c.REFERENCE_SOURCE_POST_SUBJECT_QUERY_URL = process.env.REFERENCE_SOURCE_POST_SUBJECT_QUERY_URL;
  }

  c.DOMAIN_NAME = 'not-set';
  if ((overrides) && (overrides.DOMAIN_NAME)) {
    c.DOMAIN_NAME = overrides.DOMAIN_NAME;
  } else if (process.env.DOMAIN_NAME) {
    c.DOMAIN_NAME = process.env.DOMAIN_NAME;
  }

  c.getHost = function () {
    return getHost(c);
  };

  c.getHostname = function () {
    return getHostname(c);
  };

  c.getHostnameWithPort = function () {
    return getHostnameWithPort(c);
  };

  c.getPort = function () {
    return getPort(c);
  };

  c.getPortInsideDocker = function () {
    return getPortInsideDocker(c);
  };

  c.getProtocol = function () {
    return getProtocol(c);
  };

  c.isDevelopment = function () {
    return isDevelopment(c);
  };

  c.isProduction = function () {
    return isProduction(c);
  };

  // setup the TLS related configuration options
  if ((overrides) && (overrides.SERVER_TLS_CERT_FILE)) {
    c.SERVER_TLS_CERT_FILE = overrides.SERVER_TLS_CERT_FILE;
  } else {
    c.SERVER_TLS_CERT_FILE = process.env.SERVER_TLS_CERT_FILE;
  }

  if ((overrides) && (overrides.SERVER_TLS_ENCODED_KEY_FILE)) {
    c.SERVER_TLS_ENCODED_KEY_FILE = overrides.SERVER_TLS_ENCODED_KEY_FILE;
  } else {
    c.SERVER_TLS_ENCODED_KEY_FILE = process.env.SERVER_TLS_ENCODED_KEY_FILE;
  }

  if ((overrides) && (overrides.AWS_KMS_REGION)) {
    c.AWS_KMS_REGION = overrides.AWS_KMS_REGION;
  } else {
    c.AWS_KMS_REGION = process.env.AWS_KMS_REGION;
  }

  c.INBOUND_TLS_ON = 'fixme-set-in-config';
  c.OUTBOUND_TLS_ON = 'fixme-set-in-config';

  // setup the crypto configuration
  c.crypto = {};
  c.crypto.jwt = {};
  c.crypto.jwt.issuer = c.HOSTNAME;
  c.crypto.jwt.type = 'HS256';
  if ((overrides) && (overrides.crypto) && (overrides.crypto.jwt) && (overrides.crypto.jwt.JWT_SECRET)) {
    c.crypto.jwt.secret = overrides.crypto.jwt.JWT_SECRET;
  } else if (process.env.JWT_SECRET) {
    c.crypto.jwt.secret = process.env.JWT_SECRET;
  }

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
  create: create,

  // accessors that work if pass in a config
  getHost: getHost,
  getHostname: getHostname,
  getHostnameWithPort: getHostnameWithPort,
  getPort: getPort,
  getPortInsideDocker: getPortInsideDocker,
  getProtocol: getProtocol,
  isDevelopment: isDevelopment,
  isProduction: isProduction
};
