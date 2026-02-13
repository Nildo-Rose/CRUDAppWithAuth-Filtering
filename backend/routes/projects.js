const express = require('express');
const { body, query } = require('express-validator');
const db = require('../db/database');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();
router.use(auth);

const createValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().trim(),
  body('status').optional().isIn(['active', 'archived', 'completed']).withMessage('Invalid status')
];

const updateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().trim(),
  body('status').optional().isIn(['active', 'archived', 'completed']).withMessage('Invalid status')
];

const listValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().trim(),
  query('status').optional().isIn(['active', 'archived', 'completed'])
];

function getProject(id, userId) {
  const p = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(id, userId);
  if (!p) return null;
  return { ...p, created_at: p.created_at, updated_at: p.updated_at };
}

router.get('/', listValidation, validate, (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;
  const search = (req.query.search || '').trim();
  const status = req.query.status;
  const userId = req.user.id;

  let where = 'user_id = ?';
  const params = [userId];
  if (search) {
    where += ' AND (name LIKE ? OR description LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }
  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM projects WHERE ${where}`);
  const { total } = countStmt.get(...params);

  const sql = `SELECT * FROM projects WHERE ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`;
  const list = db.prepare(sql).all(...params, limit, offset);

  res.json({
    data: list,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
});

router.get('/:id', (req, res) => {
  const project = getProject(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

router.post('/', createValidation, validate, (req, res) => {
  const { name, description, status } = req.body;
  const stmt = db.prepare(
    'INSERT INTO projects (user_id, name, description, status) VALUES (?, ?, ?, ?)'
  );
  stmt.run(req.user.id, name, description || null, status || 'active');
  const id = db.prepare('SELECT last_insert_rowid() as id').get().id;
  const project = getProject(id, req.user.id);
  res.status(201).json(project);
});

router.put('/:id', updateValidation, validate, (req, res) => {
  const project = getProject(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const { name, description, status } = req.body;
  const updates = [];
  const params = [];
  if (name !== undefined) { updates.push('name = ?'); params.push(name); }
  if (description !== undefined) { updates.push('description = ?'); params.push(description); }
  if (status !== undefined) { updates.push('status = ?'); params.push(status); }
  if (updates.length === 0) return res.json(project);
  updates.push("updated_at = datetime('now')");
  params.push(project.id);
  db.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  res.json(getProject(project.id, req.user.id));
});

router.delete('/:id', (req, res) => {
  const project = getProject(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  db.prepare('DELETE FROM tasks WHERE project_id = ?').run(project.id);
  db.prepare('DELETE FROM projects WHERE id = ?').run(project.id);
  res.status(204).send();
});

module.exports = router;
