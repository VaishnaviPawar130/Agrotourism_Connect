# Agrotourism Connect

Connect Land - Develop Tourism - Generate Revenue

This repository contains **Phase 1 (Core MVP)** of Agrotourism Connect, as defined in
[AGROTOURISM_CONNECT_PROJECT_PLAN_PHASED.md](AGROTOURISM_CONNECT_PROJECT_PLAN_PHASED.md). Phase 2 and later
(feasibility studies, financial modeling, investment commitments, resort operations, revenue sharing, public
marketplace, AI features) are **not implemented** in this build.

## Stack

**Frontend:** React 18, TypeScript, Vite, React Router, Tailwind CSS, React Hook Form, Zod, Axios, Zustand, Lucide React

**Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, bcrypt, Zod, Multer

## Folder Structure

```
backend/
  src/
    config/        env loader, MongoDB connection
    middleware/     auth (JWT + role guard), validation, error handler, file upload
    modules/        one folder per domain: auth, users, lands, projects, investors,
                     investmentInterests, leads, followUps, siteVisits, documents,
                     enquiries, dashboard, auditLogs
    routes/         central router mounting all modules under /api/v1
    utils/          ApiError, response helpers, seed script
    app.ts, server.ts
frontend/
  src/
    components/     shared UI: Button, Input, Select, DataTable, Modal, etc.
    layouts/        PublicLayout (site header/footer), DashboardLayout (role-aware sidebar)
    pages/           public/, auth/, admin/, landowner/, investor/, shared/, dashboard/
    routes/          ProtectedRoute (auth + role guard)
    services/        one file per backend module, wraps Axios calls
    store/           Zustand auth store (persisted)
    types/           shared TypeScript types/enums mirroring backend
```

Each backend module follows: `module.model.ts`, `module.validation.ts` (Zod), `module.service.ts`,
`module.controller.ts`, `module.route.ts`, `module.types.ts`. Business logic lives in services; controllers stay thin.

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a connection string to a hosted instance)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # adjust MONGODB_URI / JWT_SECRET as needed
npm run seed               # creates the Super Admin user
npm run dev                 # starts the API on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env       # adjust VITE_API_BASE_URL if backend isn't on :5000
npm run dev                 # starts the app on http://localhost:5173
```

### Seeded Super Admin

```
email:    pawarvaishu15@gmail.com
password: AgroConnect@2026
```

Change this password after first login in a real deployment.

## Environment Variables

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agrotourism_connect
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=uploads
```

**frontend/.env**
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Build / Verification Commands

```bash
# Backend
cd backend
npm run typecheck   # tsc --noEmit
npm run build        # tsc -p tsconfig.json -> dist/

# Frontend
cd frontend
npm run typecheck
npm run build         # tsc -b && vite build -> dist/
```

Both apps typecheck and build cleanly. The backend was smoke-tested end-to-end against a local MongoDB instance:
health check, seed script, login, JWT-protected dashboard summary, and public project listing all verified working.

## API Summary (`/api/v1`)

| Module | Routes |
|---|---|
| auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/forgot-password`, `POST /auth/reset-password` |
| users | `GET /users/me`, `POST /users/change-password`, `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id` |
| lands | `POST /lands`, `GET /lands`, `GET /lands/:id`, `PATCH /lands/:id`, `PATCH /lands/:id/status`, `POST /lands/:id/files`, `DELETE /lands/:id` |
| projects | `GET /projects/public`, `GET /projects/public/:slug`, `POST /projects`, `GET /projects`, `GET /projects/:id`, `PATCH /projects/:id`, `DELETE /projects/:id` |
| investors | `PUT /investors/me`, `GET /investors/me`, `GET /investors`, `GET /investors/:id` |
| investment-interests | `POST /investment-interests`, `GET /investment-interests/mine`, `GET /investment-interests`, `PATCH /investment-interests/:id/status` |
| leads | `POST /leads`, `GET /leads`, `GET /leads/:id`, `PATCH /leads/:id`, `DELETE /leads/:id` |
| follow-ups | `POST /follow-ups`, `GET /follow-ups/lead/:leadId` |
| site-visits | `POST /site-visits`, `GET /site-visits`, `GET /site-visits/:id`, `PATCH /site-visits/:id`, `POST /site-visits/:id/photos` |
| documents | `POST /documents`, `GET /documents`, `GET /documents/:id/download`, `DELETE /documents/:id` |
| enquiries | `POST /enquiries` (public), `GET /enquiries` (staff) |
| dashboard | `GET /dashboard/summary` (staff) |

All responses follow `{ success, message, data }` on success and `{ success, message, errors }` on error.

## MongoDB Collections

`users`, `landSubmissions` (Land), `projects`, `investorProfiles`, `investorInterests` (InvestmentInterest),
`leads`, `leadFollowUps`, `siteVisits`, `documents` (DocumentRecord), `enquiries`, `auditLogs`.

## Completed Modules (Phase 1)

- Public website: Home, About, Agro Tourism, Land Development, Resort Development, Investment Opportunities,
  Projects (list + detail), Services, Gallery, Knowledge Center, Contact (real enquiry form -> creates a lead)
- Authentication: register, login, logout, forgot/reset password, JWT, role-based route guards
- Landowner: land submission CRUD, file uploads, status tracking, admin review
- Project: admin creates projects from land submissions, public/private visibility, public listing
- Investor: profile management, browsing public projects, submitting investment interest
- CRM: leads (auto-created from enquiries / land submissions / investor interest), append-only follow-up history
- Site visits: scheduling, status tracking, post-visit notes
- Documents: secure upload with category + visibility enforcement (never public by default)
- Admin dashboard: live counts and recent activity from MongoDB
- Admin panel: Users, Lands, Projects, Investors, Leads, Site Visits, Enquiries, Documents management screens
- Audit logging on key actions (user/land/project/lead/document changes)

## Explicitly Deferred to Phase 2+

Feasibility studies, land/tourism-potential analysis, project concept planning, development cost & revenue
modeling, financial feasibility calculations, proposal summaries, investment commitments/payments beyond a
basic "interest" record, project development stages, approval tracking, vendor management, cottage/villa
development tracking, resort bookings and guest management, revenue/expense recording, revenue-sharing
agreements, public marketplace, payments integration, reviews, and all AI/automation features. None of this
was implemented in the current build.
