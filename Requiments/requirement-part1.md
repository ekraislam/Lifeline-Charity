# Lifeline – Charity Donation & Volunteer Management System
## REQUIREMENT — PART 1: Database + Backend + API

This is Part 1 of a 2-part requirement document for a Final Year University Project.
Part 1 covers everything needed to build a fully working, production-grade **backend**
(database, authentication, business logic, REST API, security). Part 2 (separate file)
covers the frontend, dashboards, reports, notifications UI, and deployment.

Build Part 1 completely, end-to-end, before moving to Part 2. Do not skip anything below.

---

## 0. WORKING RULES FOR THE AI (APPLY TO EVERY STEP BELOW)

- Implement **one feature/module at a time**, fully, before moving to the next.
- After **every feature is implemented and verified working**, make a git commit with a
  clear, conventional-commit-style message (e.g. `feat(auth): add JWT login with refresh token`).
- Never bundle multiple unrelated features into a single commit.
- Do not skip a feature, table, or endpoint listed below — if something is intentionally
  deferred, say so explicitly instead of silently omitting it.
- Follow SOLID principles, clean code, modular folder structure, meaningful comments.
- Every input must be validated. Every route must have proper error handling.
- Keep configuration (DB creds, JWT secret, mail creds, etc.) in `.env`, never hardcoded.

---

## 1. TECH STACK (Backend)

- Node.js + Express.js
- MySQL (fully normalized)
- JWT + bcrypt (authentication)
- Multer (file uploads)
- Nodemailer (email)
- Socket.io (real-time notifications)
- Helmet, CORS, express-rate-limit (security)
- A validation library (e.g. Joi or express-validator)

---

## 2. PROFESSIONAL BACKEND FOLDER STRUCTURE

Design a clean, modular structure, roughly:

```
backend/
  src/
    config/        (db, env, socket, mailer config)
    models/
    controllers/
    routes/
    middlewares/    (auth, role-check, error-handler, validation, upload)
    services/       (business logic, separated from controllers)
    utils/
    validations/
    sockets/
  uploads/
  .env.example
  server.js
```

Commit: `chore: scaffold backend project structure`

---

## 3. DATABASE DESIGN (MySQL)

Design a **fully normalized** schema covering all roles and modules listed below.

Required for every table:
- Primary Keys, Foreign Keys, proper Indexes, Constraints
- Cascading rules (ON DELETE / ON UPDATE) where appropriate
- `created_at`, `updated_at` timestamps on every table

Minimum tables to design (add more as needed for normalization):
- users (with role: donor, volunteer, beneficiary, ngo, admin)
- ngo_profiles
- campaigns, campaign_categories, campaign_gallery
- donations, payment_transactions
- volunteers, volunteer_tasks, volunteer_attendance, volunteer_hours, volunteer_certificates
- beneficiaries, help_requests, help_request_documents
- events, event_registrations, event_attendance, event_gallery
- notifications
- audit_logs
- feedback, comments, ratings
- bookmarks / wishlist
- categories (generic, if reused across modules)

Deliverables for this section:
- Full SQL schema file (`schema.sql`)
- ER Diagram in **Mermaid** syntax
- A short written explanation of key relationships (1-to-many, many-to-many, etc.)

Commit: `feat(db): add normalized MySQL schema and ER diagram`

---

## 4. AUTHENTICATION & AUTHORIZATION

Roles: Guest, Donor, Volunteer, Beneficiary, NGO, Admin

Implement:
- Register (role-aware)
- Login (JWT access + refresh token strategy)
- Email Verification (Nodemailer)
- Forgot Password / Reset Password (token-based, expiring)
- Role-Based Authorization middleware
- Protected route middleware
- Password hashing with bcrypt

Commit per feature, e.g.:
- `feat(auth): implement register with email verification`
- `feat(auth): implement JWT login and refresh token`
- `feat(auth): implement forgot/reset password flow`
- `feat(auth): add role-based route protection middleware`

---

## 5. USER PROFILE MODULE (API)

- Get/update profile
- Upload profile photo (Multer)
- Update phone, address
- Change password
- Notification preferences

Commit: `feat(profile): add profile CRUD, photo upload, password change`

---

## 6. CAMPAIGN MODULE (API)

- Create / Update / Delete campaign
- Admin Approve / Reject campaign
- Campaign categories
- Campaign gallery (multi-image upload)
- Goal amount, raised amount (auto-calculated from donations), deadline, status
- Featured campaign flag
- Progress calculation (for progress bar, computed server-side)

Commit: `feat(campaign): full campaign CRUD with approval workflow`

---

## 7. DONATION MODULE (API)

- Donate to a campaign
- Donation history (per user)
- Anonymous donation option
- Recurring donation (schedule/flag)
- Receipt generation data (PDF generation itself can live in Part 2 or a shared service,
  but the endpoint + data model must exist here)

Commit: `feat(donation): donation creation, history, anonymous & recurring support`

---

## 8. PAYMENT ARCHITECTURE

Design this as an **abstract/interface-based payment layer** so a real gateway
(SSLCommerz, Stripe, bKash, etc.) can be plugged in later without refactoring.

- `PaymentGatewayInterface` (or equivalent) with a mock/dummy implementation for now
- Payment records table + transaction status: success, failed, pending
- Refund status handling
- Webhook-style endpoint stub for gateway callbacks (even if mocked)

Commit: `feat(payment): abstract payment gateway interface + mock provider`

---

## 9. VOLUNTEER MODULE (API)

- Volunteer registration
- Task assignment
- Attendance tracking
- Volunteer hours logging
- Certificate generation data (record-level; PDF generation can be shared util)
- Availability scheduling

Commit: `feat(volunteer): registration, tasks, attendance, hours, availability`

---

## 10. BENEFICIARY MODULE (API)

- Help request submission
- Document upload (Multer)
- Verification workflow
- Request status tracking
- Admin approval endpoint

Commit: `feat(beneficiary): help request lifecycle with document verification`

---

## 11. EVENT MODULE (API)

- Create event
- Join event (registration)
- Volunteer registration for event
- Attendance
- Event gallery

Commit: `feat(event): event CRUD, registration, attendance, gallery`

---

## 12. NOTIFICATION (Backend)

- In-app notification model + Socket.io real-time push
- Email notification triggers (Nodemailer) for key actions (donation success,
  campaign approval, request status change, etc.)

Commit: `feat(notification): real-time in-app + email notification triggers`

---

## 13. GLOBAL SEARCH (API)

- Global search endpoint across campaigns/events/etc.
- Filtering, sorting
- Category / status / location-based search params

Commit: `feat(search): global search with filters and sorting`

---

## 14. SECURITY HARDENING (Backend)

- Helmet
- CORS configuration
- Rate limiting (express-rate-limit)
- Input validation on every route
- SQL injection protection (parameterized queries / ORM query builder)
- Centralized error-handling middleware

Commit: `feat(security): helmet, cors, rate-limiting, centralized error handling`

---

## 15. FILE HANDLING (Backend)

- Upload images/documents (Multer, with file-type & size validation)
- Delete file endpoint
- Serve/preview endpoint

Commit: `feat(files): secure upload, validation, and delete endpoints`

---

## END OF PART 1

Once every module above is implemented, tested, and committed individually,
proceed to **requirement-part2.md** (Frontend, Dashboards, Reports, Extra Features,
Deployment).
