const express = require('express');
const { body, query } = require('express-validator');
const db = require('../db/database');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();
router.use(auth);

const createValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('status').optional().isIn(['pending', 'in_progress', 'completed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
];

const updateValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('status').optional().isIn(['pending', 'in_progress', 'completed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
];

const listValidation = [
  query('search').optional().trim(),
  query('status').optional().isIn(['pending', 'in_progress', 'completed']),
  query('priority').optional().isIn(['low', 'medium', 'high'])
];

function ensureProjectAccess(projectId, userId) {
  const p = db.prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?').get(projectId, userId);
  if (!p) return null;
  return p;
}

function getTask(id, userId) {
  const t = db.prepare('SELECT t.* FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.id = ? AND p.user_id = ?').get(id, userId);
  return t || null;
}

router.get('/:projectId/tasks', listValidation, validate, (req, res) => {
  if (!ensureProjectAccess(req.params.projectId, req.user.id)) {
    return res.status(404).json({ error: 'Project not found' });
  }
  const { projectId } = req.params;
  const search = (req.query.search || '').trim();
  const status = req.query.status;
  const priority = req.query.priority;

  let where = 'project_id = ?';
  const params = [projectId];
  if (search) {
    where += ' AND (title LIKE ? OR description LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }
  if (status) { where += ' AND status = ?'; params.push(status); }
  if (priority) { where += ' AND priority = ?'; params.push(priority); }

  const list = db.prepare(`SELECT * FROM tasks WHERE ${where} ORDER BY created_at DESC`).all(...params);
  res.json({ data: list });
});

router.get('/:projectId/tasks/:id', (req, res) => {
  const task = getTask(req.params.id, req.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (String(task.project_id) !== String(req.params.projectId)) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

router.post('/:projectId/tasks', createValidation, validate, (req, res) => {
  if (!ensureProjectAccess(req.params.projectId, req.user.id)) {
    return res.status(404).json({ error: 'Project not found' });
  }
  const { projectId } = req.params;
  const { title, description, status, priority } = req.body;
  const stmt = db.prepare(
    'INSERT INTO tasks (project_id, title, description, status, priority) VALUES (?, ?, ?, ?, ?)'
  );
  stmt.run(projectId, title, description || null, status || 'pending', priority || 'medium');
  const id = db.prepare('SELECT last_insert_rowid() as id').get().id;
  const task = getTask(id, req.user.id);
  res.status(201).json(task);
});

router.put('/:projectId/tasks/:id', updateValidation, validate, (req, res) => {
  const task = getTask(req.params.id, req.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (String(task.project_id) !== String(req.params.projectId)) return res.status(404).json({ error: 'Task not found' });
  const { title, description, status, priority } = req.body;
  const updates = [];
  const params = [];
  if (title !== undefined) { updates.push('title = ?'); params.push(title); }
  if (description !== undefined) { updates.push('description = ?'); params.push(description); }
  if (status !== undefined) { updates.push('status = ?'); params.push(status); }
  if (priority !== undefined) { updates.push('priority = ?'); params.push(priority); }
  if (updates.length === 0) return res.json(task);
  updates.push("updated_at = datetime('now')");
  params.push(task.id);
  db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  res.json(getTask(task.id, req.user.id));
});

router.delete('/:projectId/tasks/:id', (req, res) => {
  const task = getTask(req.params.id, req.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (String(task.project_id) !== String(req.params.projectId)) return res.status(404).json({ error: 'Task not found' });
  db.prepare('DELETE FROM tasks WHERE id = ?').run(task.id);
  res.status(204).send();
});

module.exports = router;
