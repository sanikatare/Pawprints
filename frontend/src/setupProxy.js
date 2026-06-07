const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    ['/api', '/uploads'],
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL || 'http://localhost:5000',
      changeOrigin: true,
    })
  );
};
