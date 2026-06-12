import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().optional().default('5000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  CLIENT_URL: z.string().url(),
  CLIENT_URLS: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_REDIRECT_URI: z.string().optional(),
  FRONTEND_AUTH_ERROR_URL: z.string().optional(),
  FRONTEND_AUTH_SUCCESS_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
