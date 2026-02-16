// Standalone endpoint to verify API is deployed. Open /api/health in browser.
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ ok: true, message: 'API is deployed' });
};
