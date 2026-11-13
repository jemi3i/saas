# Contributing to NovaInvoice

Thanks for your interest! This guide explains how to set up the project, how to name branches and commits, and what to check before opening a pull request.

## Setup

1. Fork and clone the repository.
2. Follow [Getting started](README.md#getting-started) in the root README: PostgreSQL, `npm install` in `backend/` and `frontend/`, `backend/.env` from `backend/.env.example`, `npm run seed:admin`, then `npm run start:dev` (backend) and `npm run dev` (frontend).
3. Never commit `.env` files or real secrets. `.env` is already ignored by `.gitignore`.

## Branch naming

Create a branch from `main` using a type prefix:

| Prefix | Use for |
|---|---|
| `feat/` | New features (`feat/invitation-emails`) |
| `fix/` | Bug fixes (`fix/invoice-numbering`) |
| `docs/` | Documentation only |
| `refactor/` | Code changes that neither fix a bug nor add a feature |
| `test/` | Adding or improving tests |
| `chore/` | Tooling, dependencies, configuration |

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short summary>

<optional body: what and why>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `style`, `ci`.
Common scopes: `api`, `frontend`, `auth`, `invoice`, `expense`, `ai`, `scripts`.

Examples:

```
feat(team): send invitation emails
fix(api): return 403 when accessing another enterprise's business
docs: document the enterprise activation flow
```

## Before opening a pull request

Run these checks; all of them must pass:

```bash
# backend
cd backend
npm test                  # unit tests
npx tsc --noEmit -p .     # type-check
npm run build

# frontend
cd ../frontend
npx tsc --noEmit          # type-check (Vite does not type-check)
npm run build
```

Also:

- Add or update tests for any change to access control (guards, roles, tenant isolation).
- Keep business-scoped endpoints behind `JwtAuthGuard`, `BusinessAccessGuard` and `RolesGuard`.
- Never expose API keys to the frontend. Third-party calls belong in the backend.
- Update the README (features, project status, roadmap) when behavior changes.
- Keep pull requests focused on a single topic, and describe what changed and how you tested it.

## Reporting issues

Open a GitHub issue with steps to reproduce, the expected behavior and the actual behavior. For security issues, please contact the maintainer privately instead of opening a public issue.
