const app = require('../backend/app');

module.exports = (req, res) => {
  // Vercel rewrite /api/:path* -> /api/handler adds ?path=... (path-to-regexp)
  const pathFromQuery = req.query.path;
  const path = typeof pathFromQuery === 'string' ? pathFromQuery : (Array.isArray(pathFromQuery) ? pathFromQuery.join('/') : '');
  const qs = req.url && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  req.url = path ? `/api/${path}${qs}` : `/api${qs}`;
  return app(req, res);
};
