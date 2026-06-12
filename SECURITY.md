# Security Architecture & Policies

This document outlines the security mechanisms implemented in CraftSite AI.

## 1. Authentication
- **Custom Credentials**: Passwords hashed using `bcryptjs` with 10 rounds of salting.
- **OAuth (Google & GitHub)**: Leverages state cookies to prevent CSRF during callbacks.
- **Session Management**: JWT encoded sessions stored in `HttpOnly`, `Secure` (in production), `SameSite=Lax` cookies.

## 2. API Security
- **Rate Limiting**: `express-rate-limit` enforces a maximum of 100 requests per 15 minutes per IP address on standard endpoints.
- **Helmet**: Secures HTTP headers by hiding `X-Powered-By`, setting `X-Frame-Options`, and applying a basic Content Security Policy.
- **CORS**: Strictly checks origins against a predefined list (`process.env.CLIENT_URLS`).
- **Body Parsing**: JSON payload limit is restricted to `2mb`.

## 3. Environment Variable Validation
- The `config/env.ts` utilizes Zod schemas to ensure required secrets (JWT, DB URL, API Keys) exist and are formatted properly.

## 4. Dependencies
- Run `pnpm audit` regularly to check for vulnerable packages.

## 5. Security Concerns Left to Address
- Advanced Bot Protection / Captcha.
- More granular rate limiting based on route severity (e.g. 5 requests per minute for login).
- Advanced Content Security Policy for Sandpack (currently simplified for compatibility).
