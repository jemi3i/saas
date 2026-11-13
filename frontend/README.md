# NovaInvoice (frontend)

React single-page app for [NovaInvoice](../README.md). It talks to the NestJS API through the Vite dev proxy.

## Stack

- **React 19** + **TypeScript**, built with **Vite 6**
- **React Router 7** (`HashRouter`: URLs look like `/#/dashboard`)
- **Zustand 5**: state stores; auth, business, enterprise, team and settings are persisted in `localStorage`
- **react-hook-form** + **Zod**: forms and validation
- **Axios**: HTTP client with a JWT interceptor (`services/api.ts`)
- **Recharts**: charts
- **jsPDF**: invoice PDF export (plus CSV exports)
- **lucide-react**: icons
- **Tailwind CSS**: loaded from the CDN in `index.html`, with light/dark theme

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

The backend must be running on `http://localhost:3000` (see [`../backend/README.md`](../backend/README.md)).

### API proxy

The Axios client uses the base URL `/api/v1`. In development, `vite.config.ts` proxies `/api/v1` to `http://localhost:3000`, so the frontend and the API share the same origin and no API URL needs to be configured.

### Environment variables

**None.** The frontend needs no `.env` file. The Gemini API key is a backend-only variable: the dashboard's AI insights call `POST /api/v1/ai/insights/business/:businessId`, and no key is ever shipped to the browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server on port 5173 (with the API proxy) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npx tsc --noEmit` | Type-check (Vite does not type-check during build) |

## Project structure (atomic design)

```
frontend/
├── index.html            # Tailwind CDN config, fonts, theme variables
├── index.tsx             # React entry point
├── App.tsx               # routes (HashRouter), protected layout
├── vite.config.ts        # dev server, /api/v1 proxy, @ alias
├── components/
│   ├── atoms/            # Button, Input, Badge, ApprovalBadge, FileUpload, LoadingSpinner, ThemeToggle
│   ├── molecules/        # FormField, StatCard, BusinessSwitcher, RoleGuard, Toast, UserMenu, EmptyState
│   ├── organisms/        # Navbar, Sidebar, InvoiceTable, ExpenseTable, RevenueChart, ExpensePieChart,
│   │                     # ProfitLossReport, NotificationPanel, SkeletonLoader
│   └── templates/        # DashboardLayout
├── pages/                # one component per route (Dashboard, Invoices, Expenses, Clients, Reports, Team, …)
├── store/                # Zustand stores (auth, business, enterprise, client, invoice, expense, team, …)
├── services/             # api.ts (Axios), gemini.ts (AI insights via the API), pdfService.ts (PDF/CSV)
├── hooks/                # useTheme
├── lib/                  # utils (formatCurrency, formatDate, cn)
└── types/                # shared TypeScript types and enums
```

## Pages

| Route | Page | Status |
|---|---|---|
| `/login`, `/register` | Authentication | ✅ API |
| `/dashboard` | KPIs, revenue chart, AI insights (owner only), pending-approval screen | ✅ API |
| `/admin/system` | Platform administration: approve or reject enterprises | ✅ API |
| `/invoices`, `/invoices/new`, `/invoices/:id/edit` | Invoices, PDF/CSV export | ✅ API |
| `/expenses`, `/expenses/new` | Expenses and approval | ✅ API |
| `/clients`, `/clients/new`, `/clients/:id` | Clients and client detail | ✅ API (communication history is 🚧 mocked) |
| `/reports` | Reports and charts | ✅ API |
| `/team` | Team members and business assignment | ✅ API |
| `/audit-logs` | Audit logs | 🚧 Mocked |
| `/profile` | Profile | 🚧 Mocked (local state only) |
| `/settings` | Settings | 🚧 Stored locally in the browser |
| `/forgot-password` | Password reset | 🚧 Mocked |

Notifications (navbar panel) are also 🚧 mocked.
