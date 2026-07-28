# Lifeline – Charity Donation & Volunteer Management System
## REQUIREMENT — PART 2: Frontend + Dashboards + Reports + Extra Features + Deployment

This is Part 2 of a 2-part requirement document for a Final Year University Project.
Assumes **Part 1 (Database + Backend + API)** is already fully implemented and working.
This part covers the entire frontend, all dashboards, reporting, notifications UI,
search UI, extra features, and Docker-based deployment.

Build this completely, module by module. Do not skip anything below.

---

## 0. WORKING RULES FOR THE AI (APPLY TO EVERY STEP BELOW)

- Implement **one feature/page at a time**, fully, before moving to the next.
- After **every feature is implemented and verified working**, make a git commit with a
  clear, conventional-commit-style message (e.g. `feat(campaign-ui): add campaign details page`).
- Never bundle multiple unrelated features into a single commit.
- Do not skip a page, dashboard, or feature listed below — if something is intentionally
  deferred, say so explicitly instead of silently omitting it.
- Every page must be responsive (mobile/tablet/desktop).
- Use loading skeletons, empty states, and proper error states everywhere data is fetched.

---

## 1. TECH STACK (Frontend)

- React.js + Vite
- Tailwind CSS
- React Router
- Axios (with interceptors for JWT/refresh)
- React Hook Form (+ validation)
- Framer Motion (animations)
- React Icons
- Chart.js (for analytics/reports)

---

## 2. PROFESSIONAL FRONTEND FOLDER STRUCTURE

```
frontend/
  src/
    api/            (axios instance, endpoint modules)
    assets/
    components/     (shared/reusable UI components)
    features/       (feature-based: campaigns, donations, volunteers, etc.)
    layouts/        (dashboard layouts per role, guest layout)
    hooks/
    context/ or store/  (auth state, theme/dark-mode)
    pages/
    routes/         (protected route wrappers, role-based routing)
    utils/
    styles/
  .env.example
```

Commit: `chore: scaffold frontend project structure`

---

## 3. AUTH PAGES

- Register (role-aware form)
- Login
- Forgot Password / Reset Password
- Email Verification (confirmation page/state)
- Protected route wrapper + role-based route guard

Commit: `feat(auth-ui): register, login, password reset, email verification pages`

---

## 4. USER PROFILE PAGES

- View/edit profile, photo upload with preview
- Change password
- Notification preferences
- Address/phone management

Commit: `feat(profile-ui): profile page with photo upload and preferences`

---

## 5. PUBLIC / GUEST PAGES

- Home / Landing page
- Campaign listing (public) with filters
- Campaign details page (progress bar, gallery, donate CTA)
- About Page
- Contact Form
- Privacy Policy
- Terms & Conditions
- FAQs
- 404 Page
- Generic Error Page

Commit: `feat(public-ui): landing, campaign listing/details, static pages, error pages`

---

## 6. CAMPAIGN MODULE (UI)

- Create/Edit campaign form (NGO)
- Campaign gallery upload/preview
- Campaign status badges (pending/approved/rejected/featured)
- Admin approve/reject UI

Commit: `feat(campaign-ui): create/edit campaign forms and approval UI`

---

## 7. DONATION MODULE (UI)

- Donate flow (amount, anonymous toggle, recurring toggle)
- Donation history table
- Receipt view + **Download Receipt as PDF**
- Payment status display (success/failed/pending/refunded)

Commit: `feat(donation-ui): donate flow, history, PDF receipt download`

---

## 8. VOLUNTEER MODULE (UI)

- Volunteer registration form
- Task list / task detail (assigned tasks)
- Attendance marking UI
- Volunteer hours summary
- Certificate view/download
- Availability calendar/form

Commit: `feat(volunteer-ui): registration, tasks, attendance, hours, certificate`

---

## 9. BENEFICIARY MODULE (UI)

- Help request form with document upload
- Request status tracker
- Admin verification/approval UI

Commit: `feat(beneficiary-ui): help request form and status tracking`

---

## 10. EVENT MODULE (UI)

- Event listing + details
- Join event / volunteer for event
- Attendance UI
- Event gallery

Commit: `feat(event-ui): event listing, join flow, gallery`

---

## 11. NGO PANEL

- Create/manage campaigns
- View donations received
- Volunteer list for their campaigns/events
- Progress report view (charts)

Commit: `feat(ngo-panel): campaign management, donations, volunteers, progress reports`

---

## 12. ADMIN PANEL

- Dashboard overview (key metrics)
- Analytics (Chart.js visualizations)
- Manage Users
- Manage NGOs
- Manage Campaigns
- Manage Donations
- Manage Volunteers
- Manage Events
- Manage Categories
- Manage Feedback
- Manage Documents
- Notifications management
- Reports section
- Audit Logs viewer
- Website Settings

Build each of the above as its own committed unit, e.g.:
- `feat(admin): dashboard overview with key metrics`
- `feat(admin): analytics charts`
- `feat(admin): manage users`
- `feat(admin): manage ngos`
- `feat(admin): manage campaigns`
- `feat(admin): manage donations`
- `feat(admin): manage volunteers`
- `feat(admin): manage events`
- `feat(admin): manage categories`
- `feat(admin): manage feedback`
- `feat(admin): manage documents`
- `feat(admin): audit logs viewer`
- `feat(admin): website settings`

---

## 13. ROLE DASHBOARDS

- Admin Dashboard
- NGO Dashboard
- Donor Dashboard
- Volunteer Dashboard
- Beneficiary Dashboard

Each with relevant summary widgets, charts, and quick links.

Commit per dashboard, e.g.: `feat(dashboard): donor dashboard with summary widgets`

---

## 14. REPORTS

- Donation Report
- Campaign Report
- Volunteer Report
- Beneficiary Report
- Monthly Report
- Yearly Report
- Export as PDF
- Export as Excel

Commit: `feat(reports): generate and export donation/campaign/volunteer reports`

---

## 15. NOTIFICATIONS (UI)

- In-app notification bell/dropdown with real-time updates (Socket.io client)
- Notification preferences already covered in profile; wire it to real notifications here

Commit: `feat(notification-ui): real-time in-app notification center`

---

## 16. SEARCH (UI)

- Global search bar
- Filter UI (category, status, location)
- Sorting controls

Commit: `feat(search-ui): global search with filters and sorting`

---

## 17. EXTRA FEATURES

- Dark Mode toggle (persisted)
- Bookmarks
- Wishlist
- Comments
- Ratings
- Loading skeletons across all data views
- Empty states across all list views

Commit per feature, e.g.:
- `feat(ui): dark mode toggle`
- `feat(ui): bookmarks and wishlist`
- `feat(ui): comments and ratings`

---

## 18. DEPLOYMENT (Docker-based, for VPS)

- `Dockerfile` for backend (multi-stage build)
- `Dockerfile` for frontend (build + serve via Nginx)
- `docker-compose.yml` orchestrating:
  - backend service
  - frontend service
  - MySQL service
  - (optional) phpMyAdmin/Adminer for DB inspection
- **Docker named volumes** for MySQL data persistence and for uploaded files
- A dedicated Docker **network** so services communicate internally
- `.env` handling for containers (do not bake secrets into images)
- Basic Nginx reverse proxy config (if applicable) for routing frontend/backend
- Health checks for services in `docker-compose.yml`
- Document the exact commands to build, run, and stop the stack in a `DEPLOYMENT.md`

Commit: `feat(deploy): dockerize backend, frontend, mysql with docker-compose and volumes`

---

## END OF PART 2

Once every module above is implemented, tested, and committed individually, the
Lifeline platform (Parts 1 + 2 combined) is considered feature-complete per the
original specification.
