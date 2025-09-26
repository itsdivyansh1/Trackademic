# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.
``

Repository overview
- Two apps:
  - server: Express + Passport (session-based auth) + Prisma (PostgreSQL) + Redis (session store) + AWS S3 (uploads)
  - web: Next.js App Router (React 19), Axios client configured to call server with cookies
- Package manager: pnpm (each app has its own package.json; no root workspace)

Environment
- server/.env
  - PORT
  - DATABASE_URL (PostgreSQL)
  - UPSTASH_REDIS_URL
  - SESSION_SECRET
  - AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
  - S3_BUCKET_NAME
- web/.env.local
  - NEXT_PUBLIC_API_URL (base server URL, e.g. http://localhost:4000)

Common commands
- Install dependencies
  - server: cd server && pnpm install
  - web: cd web && pnpm install

- Development servers
  - server: cd server && pnpm dev
    - Express boots on PORT (default used in src/config/index.conf.ts); CORS allows http://localhost:3000
  - web: cd web && pnpm dev
    - Next.js dev server on http://localhost:3000

- Build and run (production mode)
  - server: cd server && pnpm build && pnpm start
    - Builds TypeScript to dist/ then runs node dist/index.js
  - web: cd web && pnpm build && pnpm start

- Linting
  - web: cd web && pnpm lint (ESLint Flat config via eslint.config.mjs)
  - server: no linter configured (TypeScript build performs type-checking)

- Database (Prisma)
  - All commands are run from server/
  - Generate client: pnpm prisma generate
  - Migrate dev DB: pnpm prisma migrate dev --name <migration_name>
  - Inspect data: pnpm prisma studio

- Tests
  - No test scripts detected in server or web.

Architecture summary
- Backend (server)
  - Entry: src/index.ts
    - Configures CORS for http://localhost:3000 with credentials
    - Express JSON, session middleware with RedisStore (UPSTASH_REDIS_URL)
    - Passport local strategy for email/password
    - API mounted under /api/v1 via src/routes/index.route.ts
  - Auth
    - src/config/passport.conf.ts: LocalStrategy verifies user via bcrypt, serializes/deserializes user with selected fields
    - Session cookie is httpOnly, non-secure in dev
  - Data
    - Prisma schema: User, Achievement, ResearchPublication
      - User roles: STUDENT | FACULTY | ADMIN
      - Visibility: PUBLIC | PRIVATE
      - Achievements/Publications relate to User; approvals relate back to a User
    - Postgres via DATABASE_URL
    - Redis client for session store with reconnect backoff
  - Routing
    - /api/v1/auth, /achievement, /publication, /feed, /admin (route modules in src/routes/v1)
  - Storage
    - AWS S3 client configured via AWS_* env vars (src/config/s3.config.ts)

- Frontend (web)
  - Next.js App Router with segments for authentication, marketing, and app features
  - API client: src/lib/api.ts sets baseURL `${process.env.NEXT_PUBLIC_API_URL}/api/v1` with withCredentials: true for session cookies
  - Data fetching: @tanstack/react-query; forms with react-hook-form + zod
  - UI components under src/components/ui (shadcn-style library) and sidebar components; theme/provider setup present

Local integration flow
1) Ensure server/.env and web/.env.local are set (see Environment above)
2) Start API: cd server && pnpm dev (confirm Redis connects; Prisma uses DATABASE_URL)
3) Start web: cd web && pnpm dev (ensure NEXT_PUBLIC_API_URL points to the server)
4) Web calls include credentials; CORS and session config must match origins

Notes
- The server expects the frontend at http://localhost:3000 in dev (see CORS). Adjust origin if you use a different port.
- Run Prisma migrations before relying on API endpoints that need persisted data.
