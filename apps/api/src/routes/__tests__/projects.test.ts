import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prismaMock } from '../../test/mock-prisma.js';

vi.mock('../../middleware/auth.middleware.js', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.auth = { userId: 'user-1' };
    next();
  },
}));

describe('Projects Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/projects', () => {
    it('should return projects for authenticated user', async () => {
      prismaMock.project.findMany.mockResolvedValue([
        { id: 'proj-1', title: 'Test Proj', prompt: 'test', generatedCode: 'code', userId: 'user-1', provider: 'mock', isFallback: true, isPublished: false, shareSlug: null, workspaceId: null, publishedAt: null, createdAt: new Date(), updatedAt: new Date() }
      ]);

      const res = await request(app).get('/api/projects');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(prismaMock.project.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 'user-1', workspaceId: null }
      }));
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should return 404 for non-existent project', async () => {
      prismaMock.project.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/projects/proj-999');
      expect(res.status).toBe(404);
    });

    it('should return 403 if project belongs to another user', async () => {
      prismaMock.project.findUnique.mockResolvedValue({
        id: 'proj-2', userId: 'user-2', title: 'test', prompt: 'test', generatedCode: 'code', provider: 'mock', isFallback: true, isPublished: false, shareSlug: null, workspaceId: null, publishedAt: null, createdAt: new Date(), updatedAt: new Date()
      });

      const res = await request(app).get('/api/projects/proj-2');
      expect(res.status).toBe(403);
    });

    it('should return project if user is owner', async () => {
      prismaMock.project.findUnique.mockResolvedValue({
        id: 'proj-1', userId: 'user-1', title: 'test', prompt: 'test', generatedCode: 'code', provider: 'mock', isFallback: true, isPublished: false, shareSlug: null, workspaceId: null, publishedAt: null, createdAt: new Date(), updatedAt: new Date()
      });
      const res = await request(app).get('/api/projects/proj-1');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('proj-1');
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete project if owner', async () => {
      prismaMock.project.findUnique.mockResolvedValue({
        id: 'proj-1', userId: 'user-1', title: 'test', prompt: 'test', generatedCode: 'code', provider: 'mock', isFallback: true, isPublished: false, shareSlug: null, workspaceId: null, publishedAt: null, createdAt: new Date(), updatedAt: new Date()
      });
      prismaMock.project.delete.mockResolvedValue({} as any);

      const res = await request(app).delete('/api/projects/proj-1');
      expect(res.status).toBe(200);
    });

    it('should return 403 if not owner', async () => {
      prismaMock.project.findUnique.mockResolvedValue({
        id: 'proj-2', userId: 'user-2', title: 'test', prompt: 'test', generatedCode: 'code', provider: 'mock', isFallback: true, isPublished: false, shareSlug: null, workspaceId: null, publishedAt: null, createdAt: new Date(), updatedAt: new Date()
      });

      const res = await request(app).delete('/api/projects/proj-2');
      expect(res.status).toBe(403);
    });
  });
});
