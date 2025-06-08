const cors_proxy = require('cors-anywhere');

// Listen on a specific host and port
const host = '0.0.0.0';
const port = 8001;

cors_proxy.createServer({
  originWhitelist: [], // Allow all origins
  requireHeader: [], // Do not require any headers
  removeHeaders: ['cookie', 'cookie2'] // Remove potentially sensitive headers
}).listen(port, host, function() {
  console.log('CORS Anywhere running on ' + host + ':' + port);
});