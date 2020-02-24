/*
 This set of UT validate login attempt
 to for the admin user.
 */

var request = require('supertest'),
  should = require('should');

var host = 'http://127.0.0.1:8082';

var app = request(host);

var authentication;

var invalid_admin_login = {
  'username': 'admin',
  'password': 'antani'
}

var valid_admin_login = {
  'username': 'admin',
  'password': 'globaleaks'
}

var validate_mandatory_headers = function(headers) {
  var mandatory_headers = {
    'X-XSS-Protection': '1; mode=block',
    'X-Robots-Tag': 'noindex',
    'X-Content-Type-Options': 'nosniff',
    'Expires': '-1',
    'Server': 'globaleaks',
    'Pragma':  'no-cache',
    'Cache-control': 'no-cache, no-store, must-revalidate'
  }

  for (var key in mandatory_headers) {
    if (headers[key.toLowerCase()] != mandatory_headers[key]) {
      throw key + ' != ' + mandatory_headers[key];
    }
  }
}

describe('POST /authentication', function () {
  it('responds 401 on invalid admin login', function (done) {
    app
      .post('/authentication')
      .send(invalid_admin_login)
      .expect(401)
      .end(function (err, res) {

        if (err) {
          return done(err);
        }

        validate_mandatory_headers(res.headers);

        done();
      });
  })
})

describe('POST /authentication', function () {
  it('responds 200 on valid admin login', function (done) {
    app
      .post('/authentication')
      .send(valid_admin_login)
      .expect(200)
      .end(function (err, res) {

        if (err) {
          return done(err);
        }

        validate_mandatory_headers(res.headers);

        authentication = res.body;

        done();
      });
  })
})
