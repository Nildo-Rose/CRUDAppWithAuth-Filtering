const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const db = require('../db/database');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/register', registerValidation, validate, (req, res) => {
  try {
    const { email, password, name } = req.body;
    const password_hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)');
    stmt.run(email, password_hash, name);
    const user = db.prepare('SELECT id, email, name FROM users WHERE id = last_insert_rowid()').get();
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );
    res.status(201).json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    throw err;
  }
});

router.post('/login', loginValidation, validate, (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT id, email, name, password_hash FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );
  res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
});

router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router;
