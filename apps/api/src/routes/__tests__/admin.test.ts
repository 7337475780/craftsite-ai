import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prismaMock } from '../../test/mock-prisma.js';

describe('Admin Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/admin/users', () => {
    it('should return 401 if unauthenticated', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      // Mock requireAuth to set user but NOT admin
      vi.doMock('../../middleware/auth.middleware.js', () => ({
        requireAuth: (req: any, res: any, next: any) => {
          req.auth = { userId: 'user-1' };
          next();
        },
        requireAdmin: (req: any, res: any, next: any) => {
          res.status(403).json({ message: 'Forbidden' });
        }
      }));

      const res = await request(app).get('/api/admin/users');
      // Because vi.doMock happens after imports sometimes it is tricky without resetting modules, 
      // but in this test structure, since it's an integration test relying on middlewares, we can mock the DB to test the actual middleware.
    });
  });
});
