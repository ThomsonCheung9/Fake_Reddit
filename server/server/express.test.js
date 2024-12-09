const http = require('http');
const app = require('../server.js');

describe('Express Server', () => {
  let server;

  beforeAll((done) => {
    server = app.listen(0, () => {
      done();
    });
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  test('server should be listening', (done) => {
    const port = server.address().port;

    const options = {
      hostname: 'localhost',
      port: port,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      expect(res.statusCode).toBe(200);
      done();
    });

    req.on('error', (error) => {
      done(error);
    });

    req.end();
  });
});