# GAS Digital Platform — Prototype

**Program Gigi Anak Sehat (GAS)** — Digital platform for Indonesia's preventive oral health program for preschool children.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@gas-program.id | password123 |
| Teacher (TK Tunas Bangsa) | ani.rahayu@tktunasbangsa.id | password123 |
| Teacher (PAUD Melati) | doni.kusuma@paudmelati.id | password123 |
| Gov Observer (Tangsel) | a.fauzi@dinkes-tangsel.go.id | password123 |

## Features

- **Auth Shell** — Role-aware routing with RBAC enforcement
- **LMS Module** — Courses, lessons, quizzes, certificates
- **Activity Reporting** — Submit, review, validate program reports
- **Monitoring Dashboard** — KPIs, coverage maps, school progress
- **Leaderboard** — Computed school rankings with badge tiers
- **Public Portal** — Transparency page for parents and public

## Architecture

```
/src
  /components   — UI, forms, charts, navigation, feature components
  /pages        — Role-namespaced page components
  /layouts      — PublicLayout, AuthShell, LoginLayout
  /hooks        — Custom hooks (useAuth, useLMS, useReports, etc.)
  /services     — Backend simulation modules
  /data         — JSON datasets (swap-ready for real API)
  /utils        — Permissions, formatters, scoring logic
  /context      — AuthContext, AppContext
```

## Production Migration

Each `/services/*.js` module maps to a REST endpoint:
- `authService` → `POST /api/auth/login`
- `lmsService` → `GET/PATCH /api/lms/*`
- `reportService` → `POST/PATCH /api/reports/*`
- `leaderboardService` → `GET /api/scores/*`
- `dashboardService` → `GET /api/dashboard/stats`

Zero UI changes required on backend integration.
