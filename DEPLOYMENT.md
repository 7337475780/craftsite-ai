# CraftSite AI Deployment Guide

This document outlines the steps required to deploy CraftSite AI to a production environment using **Render** for the backend, **Vercel** for the frontend, and **Supabase** for the database.

## 1. Supabase Setup (Database)

CraftSite uses Supabase PostgreSQL.

1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Under Settings > Database, find the **Connection string (URI)**.
3. This will be your `DATABASE_URL`. Make sure to replace `[YOUR-PASSWORD]` with your actual database password.

### Production Prisma Migration
Once the database is created, you must apply the Prisma schema.

**DO NOT use `prisma migrate dev` or `prisma db push` in production.**
Instead, use the deployment migration command:
```bash
pnpm --filter api exec prisma migrate deploy
```
*(This command will apply all pending migrations in `apps/api/prisma/migrations` to the production database.)*

## 2. Render Deployment (Backend API)

The backend is an Express/TypeScript API that we will deploy as a Web Service on Render.

### Render Service Setup
- **Type:** Web Service
- **Root Directory:** (leave blank, or set to the repository root)
- **Build Command:**
  ```bash
  pnpm install --frozen-lockfile && pnpm --filter api exec prisma generate && pnpm --filter api build
  ```
- **Start Command:**
  ```bash
  pnpm --filter api start
  ```

### Backend Environment Variables (Render)
Add the following Environment Variables in the Render dashboard:

```env
NODE_ENV=production
PORT=5000

# CORS URLs (Vercel domain and localhost for testing)
CLIENT_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
CLIENT_URLS=https://YOUR-VERCEL-DOMAIN.vercel.app,http://localhost:3000

# Database & Auth Secrets
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_SUPABASE_PROJECT.supabase.co:5432/postgres
JWT_SECRET=generate_a_random_secure_string_here
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://YOUR-RENDER-API.onrender.com/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=https://YOUR-RENDER-API.onrender.com/api/auth/github/callback

# OAuth Frontend Redirects
FRONTEND_AUTH_SUCCESS_URL=https://YOUR-VERCEL-DOMAIN.vercel.app/dashboard
FRONTEND_AUTH_ERROR_URL=https://YOUR-VERCEL-DOMAIN.vercel.app/sign-in?error=oauth_failed

# AI Providers
AI_PROVIDER=auto
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=qwen/qwen2.5-coder-32b-instruct
OPENROUTER_SITE_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
OPENROUTER_APP_NAME=CraftSite AI

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

## 3. Vercel Deployment (Frontend Web App)

The frontend is a Next.js 16 application configured for Turbopack.

### Vercel Project Setup
1. Import the GitHub repository into Vercel.
2. **Framework Preset:** Next.js
3. **Root Directory:** `apps/web`
4. **Build Command:** (Override the default)
   ```bash
   cd ../.. && pnpm install --frozen-lockfile && pnpm --filter web build
   ```

### Frontend Environment Variables (Vercel)
Add the following Environment Variable in the Vercel dashboard:

```env
NEXT_PUBLIC_API_URL=https://YOUR-RENDER-API.onrender.com
```

> **IMPORTANT WARNING:** Do **NOT** add your `DATABASE_URL`, `JWT_SECRET`, OAuth client secrets, or AI API Keys to the Vercel environment. Vercel only needs the `NEXT_PUBLIC_API_URL`. The backend handles all secrets.

## 4. OAuth Production Setup

### Google Cloud Console
When setting up Google OAuth for production:
- **Authorized JavaScript origins:**
  `https://YOUR-VERCEL-DOMAIN.vercel.app`
- **Authorized redirect URI:**
  `https://YOUR-RENDER-API.onrender.com/api/auth/google/callback`

### GitHub OAuth App
When setting up GitHub OAuth for production:
- **Homepage URL:**
  `https://YOUR-VERCEL-DOMAIN.vercel.app`
- **Authorization callback URL:**
  `https://YOUR-RENDER-API.onrender.com/api/auth/github/callback`

## 5. Security Notes (CORS & Cookies)

- **CORS:** The backend is configured to read from `CLIENT_URLS`. It will reject any origin not explicitly listed. It does **not** use wildcard `*` because `credentials: true` is enabled.
- **Cookies:** In production (`NODE_ENV=production`), the backend sets `sameSite: "none"` and `secure: true` for the `craftsite_token` JWT cookie. This is strictly required because the Vercel frontend and Render backend reside on different domains (Cross-Site requests). Ensure the Render app uses HTTPS.

## 6. Production Testing Checklist

After both applications are deployed successfully, perform a full sanity check:

### Auth
- [ ] Email signup works
- [ ] Email login works
- [ ] Logout works
- [ ] Google OAuth works (redirects correctly, creates session)
- [ ] GitHub OAuth works (redirects correctly, creates session)
- [ ] `/api/auth/me` returns user data
- [ ] `craftsite_token` is visible in browser DevTools (Application > Cookies), marked `Secure` and `SameSite=None`.

### Projects & Generation
- [ ] Generate a new website using a prompt
- [ ] Save the generated project
- [ ] Saved Projects page loads correctly
- [ ] AI Edit mode successfully patches the code
- [ ] Version history restores past snapshots
- [ ] Export as ZIP downloads the generated React package

### Sharing
- [ ] Click "Publish Website"
- [ ] Copy the public share link
- [ ] Open the share link in an Incognito / Logged Out window
- [ ] Verify the read-only Sandbox preview renders successfully
- [ ] Unpublish the project
- [ ] Verify the public link now returns a "Page not found" error

### Infrastructure
- [ ] Vercel frontend loads without hydration errors
- [ ] Render API health endpoint (`/api/health`) returns `{ status: "ok" }`
- [ ] Supabase connection logs show zero connection pooling/drift errors
- [ ] No CORS network errors appear in the browser console during API requests

## 7. How to Make Yourself Admin

To grant your account admin privileges, you must update the database directly:

**Option 1: Using Prisma Studio (Local)**
1. Run `pnpm --filter api exec prisma studio`
2. Open your browser to http://localhost:5555
3. Navigate to the User table.
4. Find your user record and change the `role` field from `"user"` to `"admin"`.
5. Save the changes.

**Option 2: Using Supabase SQL Editor (Production)**
1. Open your Supabase project dashboard.
2. Go to the SQL Editor.
3. Run the following query:
```sql
UPDATE "User" SET role = 'admin' WHERE email = 'your-email@example.com';
```
