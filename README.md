# MPBCDC Employee Management System

A focused **Human Resource Management System (HRMS)** built for **MPBCDC**, covering **Loan Management**, **Leave Management**, and **Employee Service Records** — not a full payroll, attendance, or compliance suite.

Developed at **Celeris Ventures** as a multi-portal, multi-tenant application aligned with the TalentCo HRMS architecture.

---

## Project Overview

| Module | Owner | Description |
|--------|-------|-------------|
| Architecture & Foundation | Shared | Auth, multi-tenancy, three portals, API conventions |
| Employee & Org Setup | Nicole | Slim employee master, department, designation, grade, region, district |
| Loan Management | Sarah | Loan types, eligibility, application, approval, disbursement, EMI |
| Leave Management | Arnav | Leave types, holidays, accrual, application, approval, balance ledger |
| Service Records | Shared (Phase 4) | Promotion, salary revision, transfer, disciplinary, documents |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Super Admin Portal | React 18 + Vite (`frontend-admin`) |
| Client Admin Portal | React 18 + Vite (`frontend-client`) |
| Employee ESS Portal | React 18 + Vite (`frontend-employee`) |
| Backend API | Node.js + Express |
| Database | MongoDB + Mongoose |
| Authentication | JWT (Bearer token, roles in payload) |
| Charts | Chart.js |
| File Upload | Multer (PDF only, max 5MB) |

---

## Repository Structure

```
├── backend/              # REST API, models, middleware, services
├── frontend-admin/       # Super Admin — tenant provisioning
├── frontend-client/      # HR, Finance, Manager, Org Admin
├── frontend-employee/    # Employee self-service (ESS)
├── MPBCDC_IMPLEMENTATION_GUIDE.pdf
└── MPBCDC_Implementation_Tracker.xlsx
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm

### Backend

```bash
cd backend
cp .env.example .env    # Windows: copy .env.example .env
npm install
npm run seed:superadmin
npm run dev             # http://localhost:5000
```

### Frontends

```bash
# Super Admin (port 5173)
cd frontend-admin && npm install && npm run dev

# Client Portal (port 5174)
cd frontend-client && npm install && npm run dev

# Employee ESS (port 5175)
cd frontend-employee && npm install && npm run dev
```

### Default Super Admin (development)

- **Login ID:** `superadmin`
- **Password:** `SuperAdmin@123`

---

## Portals & Roles

| Portal | URL | Roles |
|--------|-----|-------|
| Super Admin | http://localhost:5173 | `SUPER_ADMIN` |
| Client Admin | http://localhost:5174 | `CLIENT_ADMIN`, `HR_OFFICER`, `FINANCE_OFFICER`, `REPORTING_MANAGER`, `REGIONAL_MANAGER` |
| Employee ESS | http://localhost:5175 | `EMPLOYEE` |

---

## API Conventions

- Base path: `/api`
- Response: `{ success: true, data: ... }` or `{ success: false, error: "..." }`
- Auth: `Authorization: Bearer <token>`
- Tenant scope: `companyId` from JWT (never sent in request body)

---

## Implementation Phases

| Phase | Weeks | Focus |
|-------|-------|-------|
| 1 | 1–2 | Foundation — auth, tenants, org + employee master |
| 2 | 3–4 | Leave module end-to-end |
| 3 | 5–7 | Loan module end-to-end |
| 4 | 8–9 | Service records, reports, notifications, audit |

---

## Team

| Name | Role | Branch |
|------|------|--------|
| Arnav | Leave Management + Foundation | `dev-arnav` |
| Sarah | Loan Management | `dev-sarah` |
| Nicole | Employee & Org Setup | `dev-nicole` |
| Heramb | Project Lead | — |

**Organization repo:** [celerisventures/celeris-employee-hr-leaves-portal](https://github.com/celerisventures/celeris-employee-hr-leaves-portal)

---

## License

Private — Celeris Ventures / MPBCDC internal project.
