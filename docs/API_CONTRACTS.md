# API Contracts (v1 draft)

This document outlines REST contracts for the core modules. All endpoints are namespaced under `/api/v1` and protected by JWT authentication. Requests/ responses are JSON unless otherwise noted.

## Conventions
- **Auth**: `Authorization: Bearer <token>` required unless stated.
- **Pagination**: `?page=1&pageSize=20` with `X-Total-Count` header for list endpoints.
- **Errors**: `{ "error": { "code": "FORBIDDEN", "message": "..." } }`.
- **Filtering**: Common filters include `organisationId`, `siteId`, `from`, `to`, and status enums per resource.

## Authentication
- `POST /api/v1/auth/register` → `{ email, password, firstName, lastName, organisationName }` → creates organisation + owner user.
- `POST /api/v1/auth/login` → `{ email, password }` → `{ accessToken, refreshToken, user }`.
- `POST /api/v1/auth/refresh` → `{ refreshToken }` → new access token.

## Compliance Documents
- `POST /api/v1/documents` (admin) → create document metadata and optional assignments `{ organisationId, categoryId, title, description, assignments:[{ siteId, role }] }`.
- `POST /api/v1/documents/:id/versions` → upload/version content `{ fileUrl?, content?, effectiveFrom, effectiveTo?, changeLog }`.
- `POST /api/v1/documents/:id/assignments` → attach document to sites/roles.
- `POST /api/v1/documents/:documentId/versions/:versionId/acknowledgements` → user acknowledgement.
- `GET /api/v1/documents?siteId=` → list scoped documents with latest version and acknowledgement status for current user.

## Audits & Inspections
- `POST /api/v1/audit-templates` → `{ organisationId, name, description?, sections: JsonSchema, recurrenceRule? }`.
- `POST /api/v1/audits` → schedule audit `{ templateId, siteId, scheduledDate }`.
- `PATCH /api/v1/audits/:id/start` → mark in progress `{ performedBy }`.
- `POST /api/v1/audits/:id/responses` → `{ questionRef, response, nonConformance, evidenceUrls[] }`.
- `POST /api/v1/audits/:id/corrective-actions` → `{ auditResponseId?, checklistRunItemId?, description, assignedTo?, dueDate }`.
- `GET /api/v1/audits?siteId=&from=&to=` → history with score and non-conformance counts.

## Incident Reporting
- `POST /api/v1/incidents` → `{ siteId, type, description, occurredAt, peopleInvolved?, immediateAction?, followUpActions? }`.
- `PATCH /api/v1/incidents/:id/status` → `{ status, followUpActions?, completionNotes? }`.
- `GET /api/v1/incidents?siteId=&type=&from=&to=` → list and export-ready feed.

## Checklists
- `POST /api/v1/checklist-templates` → builder payload with item definitions and schedules.
- `POST /api/v1/checklists/instances` → create scheduled instance `{ templateId, siteId, scheduledFor }`.
- `PATCH /api/v1/checklists/:id/start` → start an instance.
- `POST /api/v1/checklists/:id/items/:itemId/responses` → record response `{ value, notes?, photos?, geo?, timestamp }`; server enforces thresholds and may spawn corrective actions.
- `PATCH /api/v1/checklists/:id/complete` → complete instance and compute status.
- `GET /api/v1/checklists?siteId=&status=` → dashboard view.

## Food Information
- `POST /api/v1/suppliers` → create/update supplier with certification docs.
- `POST /api/v1/ingredients/import` → CSV/Excel ingestion.
- `POST /api/v1/ingredients` / `PATCH /api/v1/ingredients/:id` → capture allergens/nutrition; responses include version metadata.
- `POST /api/v1/recipes` → `{ name, description, yield, portionSize, method, items:[{ ingredientId, quantity, unit }] }` returns calculated allergens/nutrition/cost.
- `POST /api/v1/menus` → create menu and attach recipes/site mappings.
- `GET /api/v1/menus/:id/allergen-matrix` → allergen matrix ready for staff/guest views.

## Temperature Monitoring
- `POST /api/v1/devices` → register sensor/manual device `{ siteId, type, safeRangeMin, safeRangeMax }`.
- `POST /api/v1/devices/:id/readings` → ingest reading `{ recordedAt, temperatureC, source }` (auth optional for trusted IoT keys).
- `GET /api/v1/devices/:id/readings?from=&to=` → history with status buckets.
- `GET /api/v1/devices/:id/alerts` → alerts and linked corrective actions.

## Time & Attendance
- `POST /api/v1/shifts` → create shift with expected times and role.
- `POST /api/v1/time-entries/clock-in` → `{ shiftId, method, timestamp }` guards against double clock-in.
- `POST /api/v1/time-entries/clock-out` → closes shift and computes worked time.
- `GET /api/v1/timesheets?siteId=&from=&to=` → aggregated hours with approval status; `PATCH /api/v1/timesheets/:id/approve` for managers.

## Notifications & Reporting
- `GET /api/v1/notifications` → inbox with pagination; `PATCH /api/v1/notifications/:id/read` to mark read.
- `GET /api/v1/reports/overview?siteId=&from=&to=` → aggregates KPI metrics (checklist completion, audit scores, temperature alerts, incidents, labour hours).
