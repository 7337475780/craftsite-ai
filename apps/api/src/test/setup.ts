import './mock-prisma.js';
import { vi } from 'vitest';

process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

// Global mocks if needed
vi.mock('../services/analytics.service.js', () => ({
  AnalyticsService: {
    trackEvent: vi.fn(),
  },
}));
