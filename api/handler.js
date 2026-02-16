module.exports = (req, res) => {
  let path = req.query.path;
  if (typeof path === 'string') path = path.replace(/^\/+|\/+$/g, '');
  else if (Array.isArray(path)) path = path.join('/');
  else path = '';
  if (!path && req.headers['x-url']) {
    try {
      const u = new URL(req.headers['x-url']);
      path = (u.pathname || '').replace(/^\/api\/?/, '');
    } catch (_) {}
  }
  const qs = req.url && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  req.url = path ? `/api/${path}${qs}` : `/api${qs}`;

  try {
    const app = require('../backend/app');
    return app(req, res);
  } catch (err) {
    console.error('API handler error:', err);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      error: 'API failed to load',
      message: err.message,
      code: err.code || null
    });
  }
};
