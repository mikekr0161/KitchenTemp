# KitchenTemp Platform Architecture

This document provides a concise architecture blueprint for the hospitality compliance and operations platform. It captures the multi-tenant data model, service boundaries, and technology stack choices so new contributors can quickly understand how to extend the system.

## Stack Overview
- **Backend:** Node.js + TypeScript with Express modular routing (upgradeable to NestJS). Prisma ORM targets PostgreSQL, with JWT authentication and role-based middleware.
- **Frontend:** React + TypeScript (Vite) with React Query for data fetching and caching. Component system is tailwind-ready and can be swapped for MUI/Chakra.
- **Mobile:** React Native planned to reuse shared TypeScript DTOs and validation; offline-first storage (e.g., SQLite/AsyncStorage) for checklists, temperature checks, and clock events.
- **API Style:** REST-first with versioned routes (`/api/v1/...`). GraphQL is reserved for analytics/reporting if data slicing becomes complex.
- **Infrastructure:** Environment-driven configuration, Prisma migrations, and a monorepo layout (`server`, `client`, `mobile` placeholder, `docs`). Centralised logging and error middleware live in the backend, with structured JSON logs for ingestion.

## Multi-tenancy & Security
- All core tables carry `organisation_id` and, where appropriate, `location_id` to enforce tenant isolation.
- JWT payloads include `userId`, `organisationId`, and `role`; middleware enforces authentication and role-based access per route.
- Application-level row scoping is required for every query; database-level constraints mirror this via foreign keys.
- Roles: **OWNER/SUPERADMIN** (platform ops), **MANAGER**, **CHEF**, **STAFF**, **TEMP_STAFF**, plus auditors with read-only scopes.
- Secrets and DB URLs are injected via environment variables. Refresh tokens are planned to be persisted for revocation.

## Domain Modules
The platform is organised into bounded contexts that map to Express route groups:
- **Compliance Documents:** Upload/version documents, assign to sites/roles, and collect acknowledgements.
- **Audits & Inspections:** Templates with JSON sections, scheduled audits, responses with evidence, and corrective actions.
- **Incidents:** Standardised incident reports with follow-up tracking.
- **Checklists:** Template builder, scheduled runs, pass/fail logic, and linkage to corrective actions.
- **Food Information:** Suppliers, ingredients, menu items, allergens, and live availability.
- **Temperature Monitoring:** Device registry (sensors and manual devices), readings, alerts, and links to corrective actions.
- **Training & Gamification:** Learning modules, assignments, and points.
- **Shifts & Attendance:** Shift planning, time entries, and daily timesheets with approvals.

## Data Model Highlights
See `prisma/schema.prisma` for the full schema. Key multi-tenant anchors:
- `Organisation` → `Location` (site) → operational entities (checklists, equipment, menu items, shifts).
- `Document` + `DocumentVersion` + `DocumentAcknowledgement` implement policy distribution and proof of reading.
- `AuditTemplate`/`Audit`/`AuditResponse` + `CorrectiveAction` capture inspections and remediation.
- `Device` + `TemperatureReading` + `TemperatureAlert` model remote/ manual readings and alerting.
- `DailyTimesheet` aggregates `TimeEntry` data for payroll exports and approvals.

## API Layer
- Versioned REST endpoints grouped by module (e.g., `/api/v1/documents`, `/api/v1/audits`, `/api/v1/checklists`).
- Request validation with Zod; all responses follow `{ data, error }` envelopes with machine-readable error codes.
- Pagination and filtering are standardised via `?page`, `?pageSize`, `?siteId`, and date-range query parameters.
- File uploads use presigned URLs or multipart endpoints, depending on deployment choice.

## Offline & Sync (Mobile)
- Checklists, manual temperature checks, and clock events are cached locally with UUIDs and timestamps.
- Sync worker pushes queued mutations when connectivity is restored; conflicts favour server truth while preserving a client-side audit trail.

## Observability & Quality
- Structured logging per request with correlation IDs.
- Prisma data access is instrumented for slow-query detection.
- Unit tests focus on domain calculations (e.g., checklist pass/fail, allergen roll-ups, time calculations). Integration tests cover end-to-end flows for the main modules.

## Deployment Notes
- Use separate environments (`dev`, `staging`, `prod`) with distinct DBs.
- Apply Prisma migrations through CI/CD before deploying application code.
- JWT secrets, storage buckets, and notification providers (email/SMS) are provisioned per environment.
