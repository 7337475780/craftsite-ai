import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prismaMock } from '../../test/mock-prisma.js';
import bcrypt from 'bcryptjs';

describe('Auth Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a valid user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed-pw',
        authProvider: 'credentials',
        image: null,
        plan: 'free',
        credits: 20,
        role: 'user',
        isBlocked: false,
        googleId: null,
        githubId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test@example.com');
      expect(res.body.data).not.toHaveProperty('passwordHash');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should return conflict for duplicate email', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-2',
        email: 'test@example.com',
        name: 'Existing',
        passwordHash: 'hash',
        authProvider: 'credentials',
        image: null,
        plan: 'free',
        credits: 20,
        role: 'user',
        isBlocked: false,
        googleId: null,
        githubId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Dup', email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already registered/i);
    });

    it('should reject weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login valid user', async () => {
      const hash = await bcrypt.hash('password123', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        passwordHash: hash,
        authProvider: 'credentials',
        image: null,
        plan: 'free',
        credits: 20,
        role: 'user',
        isBlocked: false,
        googleId: null,
        githubId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const hash = await bcrypt.hash('password123', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        passwordHash: hash,
        authProvider: 'credentials',
        image: null,
        plan: 'free',
        credits: 20,
        role: 'user',
        isBlocked: false,
        googleId: null,
        githubId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' });

      expect(res.status).toBe(401);
    });
  });
});
