import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prismaMock } from '../../test/mock-prisma.js';
import crypto from 'crypto';

vi.mock('../../middleware/auth.middleware.js', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.auth = { userId: 'user-1' };
    next();
  },
}));

// Mock razorpay service
vi.mock('../../services/payment.service.js', () => ({
  createRazorpayOrder: vi.fn().mockResolvedValue({
    orderId: 'order_test123',
    amount: 9900,
    currency: 'INR',
    plan: 'pro',
    razorpayKeyId: 'test_key'
  }),
  markPaymentSuccess: vi.fn().mockResolvedValue({
    success: true,
    message: 'Payment verified successfully',
    payment: {
      id: 'pay_1',
      userId: 'user-1',
      status: 'paid',
      amount: 9900,
      plan: 'pro'
    }
  })
}));

describe('Billing Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/billing/create-order', () => {
    it('should create order for Pro plan', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        plan: 'free',
      } as any);
      
      prismaMock.payment.create.mockResolvedValue({ id: 'pay_1' } as any);

      const res = await request(app)
        .post('/api/billing/create-order')
        .send({ plan: 'pro' });

      expect(res.status).toBe(200);
      expect(res.body.data.amount).toBe(9900);
    });

    it('should reject invalid plan', async () => {
      const res = await request(app)
        .post('/api/billing/create-order')
        .send({ plan: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/billing/verify-payment', () => {
    it('should verify correct signature and upgrade user', async () => {
      prismaMock.payment.findFirst.mockResolvedValue({
        id: 'pay_1',
        userId: 'user-1',
        status: 'pending',
        amount: 9900,
        plan: 'pro'
      } as any);

      // We mocked PaymentService.verifyPayment to return true

      prismaMock.$transaction.mockImplementation(async (cb) => {
        return cb(prismaMock);
      });

      const res = await request(app)
        .post('/api/billing/verify-payment')
        .send({
          razorpay_order_id: 'order_1',
          razorpay_payment_id: 'pay_1',
          razorpay_signature: 'sig_1',
          plan: 'pro'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
