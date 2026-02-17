const request = require('supertest');
const app = require('../app');

describe('POST /api/auth/register', () => {
  it('returns 400 when email is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123', name: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.error || res.body.errors).toBeDefined();
  });

  it('returns 400 when password is too short', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: '12345', name: 'Test' });
    expect(res.status).toBe(400);
  });

  it('returns 201 and user + token when valid', async () => {
    const email = `user-${Date.now()}@test.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email, password: 'password123', name: 'Test User' });
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email, name: 'Test User' });
    expect(res.body.token).toBeDefined();
  });
});

describe('POST /api/auth/login', () => {
  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid|password/i);
  });

  it('returns 400 when body is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-email' });
    expect(res.status).toBe(400);
  });
});
