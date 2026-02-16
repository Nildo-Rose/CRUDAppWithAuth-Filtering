const app = require('../backend/app');

module.exports = (req, res) => {
  // Vercel rewrite /api/:path* -> /api/handler?path=:path*
  let path = req.query.path;
  if (typeof path === 'string') path = path.replace(/^\/+|\/+$/g, '');
  else if (Array.isArray(path)) path = path.join('/');
  else path = '';
  // Fallback: some proxies send original path in header
  if (!path && req.headers['x-url']) {
    try {
      const u = new URL(req.headers['x-url']);
      path = (u.pathname || '').replace(/^\/api\/?/, '');
    } catch (_) {}
  }
  const qs = req.url && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  req.url = path ? `/api/${path}${qs}` : `/api${qs}`;
  return app(req, res);
};
