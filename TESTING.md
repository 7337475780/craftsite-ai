# Testing Strategy & CI/CD Pipeline

## 1. Testing Frameworks
- **Backend**: `Vitest` + `Supertest` (Mocked Prisma with `vitest-mock-extended`). Ensures robust API coverage without side effects on DB.
- **Frontend Components**: `Vitest` + `React Testing Library` for standard isolated UI components (`Navbar.tsx`).
- **End-to-End**: `Playwright` simulates realistic user flows using a headless browser across the full stack.

## 2. CI/CD Workflows
A GitHub Actions workflow (`.github/workflows/ci.yml`) is set up to run on `push` and `pull_request` against `main`. It handles:
- Checking out code
- Installing dependencies using `pnpm`
- Generating Prisma Client
- Executing a full Turbo build
- Running `api test`, `web test`, and `web test:e2e` in parallel sequence

## 3. Best Practices Followed
- We never use actual production API keys during testing.
- AI Provider integrations are mocked heavily using `vitest-mock-extended`.
- Payment webhooks are validated by injecting mocked `crypto` verification logic.
