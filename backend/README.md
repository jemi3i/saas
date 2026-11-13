# NovaInvoice API (backend)

NestJS REST API for [NovaInvoice](../README.md). All routes are prefixed with `/api/v1`; interactive docs (Swagger UI) are served at **`/api/docs`**.

## Stack

- **NestJS 10** + TypeScript
- **TypeORM 0.3** + **PostgreSQL** (`pg`)
- **Passport JWT** — access token (Bearer header) + refresh token (request body)
- **bcryptjs** — password and refresh-token hashing
- **class-validator / class-transformer** — global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`)
- **Swagger** (`@nestjs/swagger`)
- **@google/genai** — optional server-side AI insights
- **Jest** + ts-jest — unit tests

## Setup

```bash
npm install
cp .env.example .env     # then edit the values (see below)
npm run seed:admin       # create the platform admin (idempotent)
npm run start:dev        # http://localhost:3000/api/v1 — docs at /api/docs
```

PostgreSQL must be running and the database must exist (see the root README for a `docker run` command). With `NODE_ENV=development`, the schema is created automatically by TypeORM `synchronize` — there are no migrations yet.

## Environment variables

Defined in [`.env.example`](.env.example).

| Name | Required | Description |
|---|---|---|
| `DB_HOST` | ✅ | PostgreSQL host |
| `DB_PORT` | ✅ | PostgreSQL port |
| `DB_USERNAME` | ✅ | Database user |
| `DB_PASSWORD` | ✅ | Database password |
| `DB_DATABASE` | ✅ | Database name |
| `JWT_SECRET` | ✅ | Access-token signing secret |
| `JWT_EXPIRES_IN` | ✅ | Access-token lifetime (e.g. `15m`) |
| `JWT_REFRESH_SECRET` | ✅ | Refresh-token signing secret (different from `JWT_SECRET`) |
| `JWT_REFRESH_EXPIRES_IN` | ✅ | Refresh-token lifetime (e.g. `7d`) |
| `PORT` | — | HTTP port, default `3000` |
| `NODE_ENV` | ✅ | `development` enables `synchronize` and SQL logging |
| `GEMINI_API_KEY` | — | Gemini API key; when empty, `POST /ai/insights/...` returns `503 AI disabled` |
| `ADMIN_EMAIL` | for `seed:admin` | Platform admin email |
| `ADMIN_PASSWORD` | for `seed:admin` | Platform admin password (min. 8 characters) |

## Scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Start in watch mode |
| `npm run start:debug` | Start in debug + watch mode |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run `dist/main` |
| `npm test` | Run unit tests |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:cov` | Tests with coverage |
| `npm run seed:admin` | Create the `platform_admin` from `ADMIN_EMAIL` / `ADMIN_PASSWORD`; does nothing if the user already exists |
| `npx tsc --noEmit -p .` | Type-check |

> `lint` and `migration:*` scripts exist in `package.json` but are **not functional yet** (no ESLint config, no `src/config/data-source.ts`). See the roadmap in the root README.

## Project structure

```
backend/
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── src/
    ├── main.ts                      # bootstrap: /api/v1 prefix, CORS, ValidationPipe, Swagger
    ├── app.module.ts                # config, TypeORM, feature modules
    ├── common/
    │   ├── decorators/              # @Roles(), @CurrentUser()
    │   ├── enums/                   # Role, EnterpriseStatus, InvoiceStatus, ExpenseStatus, ExpenseCategory, ClientType
    │   └── guards/                  # RolesGuard, BusinessAccessGuard (+ unit tests)
    ├── modules/
    │   ├── auth/                    # register, login, refresh, logout, me — JWT strategies & guards
    │   ├── user/                    # User entity and service
    │   ├── enterprise/              # enterprises + approval status
    │   ├── business/                # businesses of an enterprise
    │   ├── team/                    # members, invitations, UserBusiness assignments
    │   ├── client/                  # clients of a business
    │   ├── invoice/                 # invoices of a business
    │   ├── expense/                 # expenses of a business + approval
    │   └── ai/                      # Gemini financial insights (+ unit test)
    └── scripts/
        └── seed-admin.ts            # npm run seed:admin
```

## Access control

Guards are applied in this order: `JwtAuthGuard` → `BusinessAccessGuard` → `RolesGuard`.

**`BusinessAccessGuard`** (`src/common/guards/business-access.guard.ts`) reads the business id from `:businessId` (or from another param declared with `@BusinessIdParam('id')`):

- `platform_admin` → allowed
- `client_external` → 403
- business not found → 404
- business's enterprise not `active` → 403
- `business_owner` / `business_admin` → allowed if the business belongs to their enterprise
- `accountant` / `team_member` → allowed only with an active `UserBusiness` link to that business

Resources addressed by `:id` are always looked up with `{ id, businessId }`, so a resource from another business returns 404.

## Modules & endpoints

Legend — **JWT**: any authenticated user · **BA-guard**: `BusinessAccessGuard` · **PA**: platform_admin · **BO**: business_owner · **BAd**: business_admin · **ACC**: accountant.

### auth — `/auth`

| Method | Route | Access |
|---|---|---|
| POST | `/auth/register` | Public — creates the user and, if `enterpriseName` is provided, a `pending` enterprise |
| POST | `/auth/login` | Public |
| POST | `/auth/refresh` | Refresh token in body (`refreshToken`) |
| POST | `/auth/logout` | JWT |
| GET | `/auth/me` | JWT |

### user

No controller. Provides the `User` entity and `UserService` (lookup, refresh-token hashing/validation) to other modules.

### enterprise — `/enterprises`

| Method | Route | Access |
|---|---|---|
| GET | `/enterprises` | PA |
| GET | `/enterprises/statistics` | PA |
| GET | `/enterprises/pending` | PA |
| GET | `/enterprises/my-enterprise` | JWT |
| GET | `/enterprises/:id` | PA or own enterprise, else 403 |
| POST | `/enterprises` | PA |
| PUT | `/enterprises/:id` | PA or own enterprise, else 403 (`status` ignored for non-admins) |
| PATCH | `/enterprises/:id/status` | PA — `pending` / `active` / `suspended` / `rejected` |
| DELETE | `/enterprises/:id` | PA |

### business — `/businesses`

| Method | Route | Access |
|---|---|---|
| GET | `/businesses` | PA |
| GET | `/businesses/my-businesses` | JWT |
| GET | `/businesses/enterprise/:enterpriseId` | PA or own enterprise, else 403 |
| GET | `/businesses/stats` | JWT — own enterprise (global for PA) |
| GET | `/businesses/:id` | BA-guard |
| POST | `/businesses` | PA, BO, BAd |
| PUT | `/businesses/:id` | BA-guard |
| PATCH | `/businesses/:id/compliance` | PA |
| DELETE | `/businesses/:id` | PA, BO, BAd |

### team — `/team`

| Method | Route | Access |
|---|---|---|
| POST | `/team/accept-invitation` | Public (invitation token) |
| GET | `/team/members` | BO, BAd |
| GET | `/team/invitations` | BO, BAd |
| POST | `/team/invite` | BO, BAd — returns an invitation link (no email is sent yet) |
| POST | `/team/create` | BO, BAd |
| PUT | `/team/members/:id` | BO, BAd |
| DELETE | `/team/members/:id` | BO, BAd |
| DELETE | `/team/invitations/:id` | BO, BAd |
| POST | `/team/assign-business` | BO, BAd |
| DELETE | `/team/members/:userId/business/:businessId` | BO, BAd |
| GET | `/team/my-businesses` | JWT |

### client — `/clients` (JWT + BA-guard on every route)

| Method | Route |
|---|---|
| GET | `/clients/business/:businessId` |
| GET | `/clients/business/:businessId/search?q=` |
| GET | `/clients/:id/business/:businessId` |
| POST | `/clients/business/:businessId` |
| PUT | `/clients/:id/business/:businessId` |
| DELETE | `/clients/:id/business/:businessId` |

### invoice — `/invoices` (JWT + BA-guard on every route)

| Method | Route |
|---|---|
| GET | `/invoices/business/:businessId` |
| GET | `/invoices/business/:businessId/stats` |
| GET | `/invoices/:id/business/:businessId` |
| POST | `/invoices/business/:businessId` — client must belong to the same business |
| PUT | `/invoices/:id/business/:businessId` |
| PUT | `/invoices/:id/business/:businessId/paid` |
| PUT | `/invoices/:id/business/:businessId/sent` |
| DELETE | `/invoices/:id/business/:businessId` |

Totals (subtotal, tax, total) are computed server-side from the line items and the tax rate.

### expense — `/expenses` (JWT + BA-guard on every route)

| Method | Route | Extra access |
|---|---|---|
| GET | `/expenses/business/:businessId` | |
| GET | `/expenses/business/:businessId/stats` | |
| GET | `/expenses/business/:businessId/by-category` | |
| GET | `/expenses/:id/business/:businessId` | |
| POST | `/expenses/business/:businessId` | |
| PUT | `/expenses/:id/business/:businessId` | |
| PUT | `/expenses/:id/business/:businessId/approve` | BO, BAd, ACC — body `{ "status": "approved" \| "rejected" }`; records `approvedById` and `approvedAt` |
| DELETE | `/expenses/:id/business/:businessId` | |

Expenses start as `pending`. Stats and by-category totals only count `approved` expenses.

### ai — `/ai`

| Method | Route | Access |
|---|---|---|
| POST | `/ai/insights/business/:businessId` | JWT + BA-guard + BO |

Loads the business's invoices from the database, sends a summary (client, amount, status, due date) to Gemini (`gemini-3-flash-preview`) and returns `{ "insights": "..." }`. Returns **503** when `GEMINI_API_KEY` is not set.

## Tests

```bash
npm test
```

Unit tests with mocked repositories (no database needed):

| File | Covers |
|---|---|
| `src/common/guards/business-access.guard.spec.ts` | Every `BusinessAccessGuard` rule: cross-enterprise 403, team_member with/without link, inactive link, accountant, client_external, pending enterprise, unknown business 404 |
| `src/common/guards/tenant-guards-wiring.spec.ts` | Client / invoice / expense / AI controllers use `JwtAuthGuard → BusinessAccessGuard → RolesGuard`; only owner/admin/accountant can approve expenses |
| `src/common/guards/enterprise-business-access.spec.ts` | 403 on another enterprise for `/enterprises/:id` and `/businesses/enterprise/:id`; scoped `/businesses/stats`; guard on `GET`/`PUT /businesses/:id` |
| `src/modules/ai/ai.service.spec.ts` | 503 when `GEMINI_API_KEY` is missing |
