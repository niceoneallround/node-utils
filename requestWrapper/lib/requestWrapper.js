/*jslint node: true, vars: true */

//
// Provide utility routines when using request from the server or client
// was finding using the same code in many places so put here
//
//  For now does not do much, maybe more in the future
//
const assert = require('assert');
const request = require('request');
const util = require('util');

//
// Utitility routine to POST a JWT to a URL
// *props - will base on request options
// *data - the jsonld to send
// *callback(err, response, body)
//
function postJWT(props, callback) {
  'use strict';

  // create request options
  // note props can have a Map of headers to add
  function createRequestOptions(props, next) {
    assert(props.url, util.format('props.url missing:%j', props));
    assert(props.jwt, util.format('props.jwt missing:%j', props));

    let headers = {
      'Content-Type': 'text/plain', // was not sure so put this
      'Content-Length': Buffer.byteLength(props.jwt)
    };

    // props.headers is a MAP;
    if (props.headers) {
      props.headers.forEach(function (value, key) {
        headers[key] = value;
      });
    }

    if (props.tls) {
      assert(false, 'restserver - Add code for tls path');
      return next(null,
        {
          key:    'foobar', // key from the protected store
          cert:   'foobar', //protectedStore.serverTlsCertBuffer(),
          url: props.url,
          method: 'POST',
          body: props.jwt,
          requestCert:        true,
          rejectUnauthorized: false, // added this as no ability to check the cert returned by Aetna as no chain
          agent: false,
          headers: headers
        }); // next
    } else {
      return next(null,
        {
          method: 'POST',
          body: props.jwt,
          url: props.url,
          headers: headers
        }); // next
    }
  } // createRequestOptions

  createRequestOptions(props, function (err, requestOpts) {
    // turn on request debug
    //require('request').debug = true;
    request(requestOpts, function (err, response, body) {

      // just return the body which may be a JWT and let caller deal with
      return callback(err, response, body);
    }); // request
  });
} // postJWT

//
// Utitility routine to POST a JSON to a URL
// *props - will base on request options
// *data - the jsonld to send
// *callback(err, response, body)
//
function postJSON(props, callback) {
  'use strict';

  // create request options
  // note props can have a Map of headers to add
  function createRequestOptions(props, next) {
    assert(props.url, util.format('props.url missing:%j', props));
    assert(props.json, util.format('props.json missing:%j', props));

    let jsonS =  JSON.stringify(props.json);

    let headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(jsonS)
    };

    // props.headers is a MAP
    if (props.headers) {
      props.headers.forEach(function (value, key) {
        headers[key] = value;
      });
    }

    if (props.tls) {
      assert(false, 'restserver - Add code for tls path');
      return next(null,
        {
          key:    'foobar', // key from the protected store
          cert:   'foobar', //protectedStore.serverTlsCertBuffer(),
          url: props.url,
          method: 'POST',
          body: jsonS,
          requestCert:        true,
          rejectUnauthorized: false, // added this as no ability to check the cert returned by Aetna as no chain
          agent: false,
          headers: headers
        }); // next
    } else {
      return next(null,
        {
          method: 'POST',
          body: jsonS,
          url: props.url,
          headers: headers
        }); // next
    }
  } // createRequestOptions

  createRequestOptions(props, function (err, requestOpts) {
    // turn on request debug
    //require('request').debug = true;
    request(requestOpts, function (err, response, body) {

      // just return the body which may be a JWT and let caller deal with
      return callback(err, response, body);
    }); // request
  });
} // postJSON

//
// Utitility routine to POST a text to a URL
// *props - will base on request options
// *data - the jsonld to send
// *callback(err, response, body)
//
function post(props, callback) {
  'use strict';

  // create request options
  // note props can have a Map of headers to add
  function createRequestOptions(props, next) {
    let queryString;
    assert(props.url, util.format('props.url missing:%j', props));
    assert(props.text, util.format('props.text missing:%j', props));

    let headers = {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Length': Buffer.byteLength(props.text)
    };

    // props.headers is a MAP
    if (props.headers) {
      props.headers.forEach(function (value, key) {
        headers[key] = value;
      });
    }

    if (props.qs) {
      queryString = props.qs;
    } else {
      queryString = null;
    }

    if (props.tls) {
      assert(false, 'restserver - Add code for tls path');
      return next(null,
        {
          key:    'foobar', // key from the protected store
          cert:   'foobar', //protectedStore.serverTlsCertBuffer(),
          url: props.url,
          method: 'POST',
          body: props.text,
          qs: queryString,
          requestCert:        true,
          rejectUnauthorized: false, // added this as no ability to check the cert returned by Aetna as no chain
          agent: false,
          headers: headers
        }); // next
    } else {
      return next(null,
        {
          method: 'POST',
          body: props.text,
          url: props.url,
          qs: queryString,
          headers: headers
        }); // next
    }
  } // createRequestOptions

  createRequestOptions(props, function (err, requestOpts) {
    // turn on request debug
    //require('request').debug = true;
    request(requestOpts, function (err, response, body) {

      // just return the body which may be a JWT and let caller deal with
      return callback(err, response, body);
    }); // request
  });
} // postJSON

//
// Utitility routine to GET
// *props - will base on request options
// *data - the jsonld to send
// *callback(err, response, body)
//
function get(props, callback) {
  'use strict';

  let headers = null;

  // create request options
  function createRequestOptions(props, next) {
    assert(props.url, util.format('props.url missing:%j', props));

    // props.headers is a MAP
    if (props.headers) {
      headers = {};
      props.headers.forEach(function (value, key) {
        headers[key] = value;
      });
    }

    if (props.tls) {
      assert(false, 'restserver - Add code for tls path');
      return next(null,
        {
          key:    'foobar', // key from the protected store
          cert:   'foobar', //protectedStore.serverTlsCertBuffer(),
          url: props.url,
          method: 'GET',
          requestCert:        true,
          rejectUnauthorized: false, // added this as no ability to check the cert returned by Aetna as no chain
          agent: false,
          headers: headers
        }); // next
    } else {
      return next(null,
        {
          method: 'GET',
          url: props.url,
          headers: headers
        }); // next
    }
  } // createRequestOptions

  createRequestOptions(props, function (err, requestOpts) {
    // turn on request debug
    //require('request').debug = true;
    request(requestOpts, function (err, response, body) {

      // just return the body which may be a JWT and let caller deal with
      return callback(err, response, body);
    }); // request
  });
} // get

//
// Utitility routine to fetch a JWT
// *props - will base on request options
// *data - the jsonld to send
// *callback(err, response, body)
//
function getJWT(props, callback) {
  'use strict';
  return get(props, callback);
}

//
// Create a Basic auth token that is of the format
//  Basic <username:password in base64 encoded format>
//
// Put in http header Authorization
//
function generateBasicAuthTokenForHeader(username, password) {
  'use strict';
  assert(username, 'generateBasicAuthTokenForHeader username param missing');
  assert(password, 'generateBasicAuthTokenForHeader password param missing');

  return 'Basic ' + new Buffer(username + ':' + password).toString('base64');
}

//
// Add promise versions of the above
//
let promises = {};

promises.postJWT = function ppostJWT(props) {
  'use strict';
  return new Promise(function (resolve, reject) {
    postJWT(props, function (err, rsp) {
      if (err) {
        reject(err);
      } else {
        resolve(rsp);
      }
    });
  });
};

promises.postJSON = function ppostJSON(props) {
  'use strict';
  return new Promise(function (resolve, reject) {
    postJSON(props, function (err, rsp) {
      if (err) {
        reject(err);
      } else {
        resolve(rsp);
      }
    });
  });
};

promises.post = function ppost(props) {
  'use strict';
  return new Promise(function (resolve, reject) {
    post(props, function (err, rsp) {
      if (err) {
        reject(err);
      } else {
        resolve(rsp);
      }
    });
  });
};

promises.getJWT = function pgetWT(props) {
  'use strict';
  return new Promise(function (resolve, reject) {
    getJWT(props, function (err, rsp) {
      if (err) {
        reject(err);
      } else {
        resolve(rsp);
      }
    });
  });
};

promises.get = function pget(props) {
  'use strict';
  return new Promise(function (resolve, reject) {
    get(props, function (err, rsp) {
      if (err) {
        reject(err);
      } else {
        resolve(rsp);
      }
    });
  });
};

module.exports = {

  generateBasicAuthTokenForHeader: generateBasicAuthTokenForHeader,

  get: get,
  post: post,

  getJWT: getJWT,
  postJWT: postJWT,

  postJSON: postJSON,

  promises: promises,
};
