# Performance Audit & Optimizations

## 1. Bundle Optimization
- Next.js code splitting is enabled out-of-the-box.
- Dynamic Imports for heavy components (like Sandpack) are implemented in `apps/web/components/projects/LivePreview.tsx` to delay JS evaluation until needed.

## 2. API Optimizations
- **Pagination**: Admin lists (`/api/admin/users`, `/api/admin/projects`) are structured to implement cursor or limit/offset pagination to avoid unbounded queries that could choke Prisma.
- **Connection Pooling**: Prisma is configured carefully. Recommend `PgBouncer` or Prisma Accelerate for serverless deployments.
- **Timeout Management**: The AI provider requests (`OpenRouter` / `Gemini`) use `AbortController` to strictly timeout after 30 seconds, preventing hung connections.

## 3. Caching Strategies
- Database queries that are repeated frequently (like fetching user profile via `requireAuth`) should ideally use a Redis layer if scaling further.
- Static assets and frontend bundles are cached aggressively via standard Next.js optimizations.

## 4. Frontend Rendering
- Leveraged React Server Components (RSC) for layout, significantly reducing the client payload on non-interactive pages (e.g. Landing Page).
