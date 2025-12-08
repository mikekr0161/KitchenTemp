# KitchenTemp

KitchenTemp is a multi-tenant hospitality compliance and operations platform that brings food safety, due diligence, menu/allergen management, temperature monitoring, and workforce tools into a single stack.

## Repository Layout
- `server/`: Express + TypeScript API using Prisma + PostgreSQL.
- `client/`: React + TypeScript web app scaffolded with Vite.
- `docs/`: Architecture notes and API contract drafts.

## Getting Started
1. Install dependencies
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
2. Create a `.env` in `server/` with at least:
   ```bash
   DATABASE_URL="postgresql://user:pass@localhost:5432/kitchentemp"
   JWT_SECRET="super-secret"
   JWT_REFRESH_SECRET="super-refresh-secret"
   ```
3. Generate Prisma client and run the dev server
   ```bash
   cd server
   npx prisma generate
   npm run dev
   ```

## Documentation
- Architecture blueprint: `docs/ARCHITECTURE.md`
- API contract drafts: `docs/API_CONTRACTS.md`
- Prisma schema covering compliance, audits, incidents, temperature monitoring, and attendance: `server/prisma/schema.prisma`

## Testing
- Backend utility tests: `cd server && npm test`

## Roadmap Highlights
- Flesh out per-module routes in `/api/v1` with validation and RBAC.
- Add offline-first mobile client for checklists, temperature checks, and time clocking.
- Integrate notification providers (email/SMS) and PDF/CSV exports for regulators.
