require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const db = require('../db/database');

const password_hash = bcrypt.hashSync('password123', 10);

db.prepare(
  'INSERT OR IGNORE INTO users (id, email, password_hash, name) VALUES (1, ?, ?, ?)'
).run('demo@example.com', password_hash, 'Demo User');

const userId = 1;
const projectIds = db.prepare('SELECT id FROM projects WHERE user_id = ?').all(userId).map(r => r.id);
projectIds.forEach(pid => db.prepare('DELETE FROM tasks WHERE project_id = ?').run(pid));
db.prepare('DELETE FROM projects WHERE user_id = ?').run(userId);

const projectStmt = db.prepare(
  'INSERT INTO projects (user_id, name, description, status) VALUES (?, ?, ?, ?)'
);
const projects = [
  ['Website Redesign', 'Rebuild company website with modern stack', 'active'],
  ['API v2', 'REST API with OpenAPI docs', 'active'],
  ['Mobile App', 'React Native app for customers', 'archived']
];
projects.forEach(([name, desc, status]) => projectStmt.run(userId, name, desc, status));

const projectIdsAfter = db.prepare('SELECT id FROM projects WHERE user_id = ? ORDER BY id').all(userId).map(r => r.id);
const taskStmt = db.prepare(
  'INSERT INTO tasks (project_id, title, description, status, priority) VALUES (?, ?, ?, ?, ?)'
);

const tasksByProject = [
  [
    ['Design mockups', 'Figma wireframes', 'in_progress', 'high'],
    ['Setup repo', 'Git and CI', 'completed', 'medium'],
    ['Content audit', 'List all pages', 'pending', 'low']
  ],
  [
    ['Define endpoints', 'OpenAPI spec', 'completed', 'high'],
    ['Auth middleware', 'JWT validation', 'in_progress', 'high'],
    ['Pagination', 'List endpoints', 'pending', 'medium']
  ],
  [
    ['Navigation', 'Bottom tabs', 'pending', 'medium'],
    ['Login screen', 'Auth flow', 'pending', 'high']
  ]
];

projectIdsAfter.forEach((projectId, i) => {
  const tasks = tasksByProject[i] || [];
  tasks.forEach(([title, desc, status, priority]) => {
    taskStmt.run(projectId, title, desc, status, priority);
  });
});

console.log('Seed complete. Demo user: demo@example.com / password123');
