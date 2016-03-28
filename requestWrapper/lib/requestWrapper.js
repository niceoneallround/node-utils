/*jslint node: true, vars: true */

//
// Provide utility routines when using request from the server or client
// was finding using the same code in many places so put here
//
//  For now does not do much, maybe more in the future
//
var assert = require('assert'),
    request = require('request'),
    util = require('util');

//
// Utitility routine to POST to a URL
// *props - will base on request options
// *data - the jsonld to send
// *callback(err, response, body)
//
function postJWT(props, callback) {
  'use strict';

  // create request options
  function createRequestOptions(props, next) {
    assert(props.url, util.format('props.url missing:%j', props));
    assert(props.jwt, util.format('props.jwt missing:%j', props));

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
          agent: false
        }); // next
    } else {
      return next(null,
        {
          method: 'POST',
          body: props.jwt,
          url: props.url,
          headers: {
            'Content-Type': 'text/plain', // was not sure so put this
            'Content-Length': Buffer.byteLength(props.jwt)
          }
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
} // post

//
// Utitility routine to fetch a JWT
// *props - will base on request options
// *data - the jsonld to send
// *callback(err, response, body)
//
function getJWT(props, callback) {
  'use strict';

  // create request options
  function createRequestOptions(props, next) {
    assert(props.url, util.format('props.url missing:%j', props));

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
          agent: false
        }); // next
    } else {
      return next(null,
        {
          method: 'GET',
          url: props.url
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
} // post

module.exports = {

  getJWT: getJWT,
  postJWT: postJWT
};
