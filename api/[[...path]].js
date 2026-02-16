const app = require('../backend/app');

module.exports = (req, res) => {
  // Restore full path for Express when Vercel passes path segments in query (catch-all)
  const pathSegments = req.query.path;
  if (pathSegments) {
    const path = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;
    const qs = req.url && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    req.url = `/api/${path}${qs}`;
  }
  return app(req, res);
};
