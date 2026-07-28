# Lifeline Database Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ NGO_PROFILES : "1 to 0..1"
    USERS ||--o{ DONATIONS : "makes"
    USERS ||--o{ VOLUNTEERS : "1 to 0..1"
    USERS ||--o{ BENEFICIARIES : "1 to 0..1"
    USERS ||--o{ EVENTS : "organizes"
    USERS ||--o{ EVENT_REGISTRATIONS : "registers"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ AUDIT_LOGS : "performs"
    USERS ||--o{ FEEDBACK : "gives"
    USERS ||--o{ BOOKMARKS : "saves"
    USERS ||--o{ HELP_REQUESTS : "approves"

    NGO_PROFILES ||--o{ CAMPAIGNS : "creates"
    
    CATEGORIES ||--o{ CAMPAIGNS : "categorizes"

    CAMPAIGNS ||--o{ CAMPAIGN_GALLERY : "has images"
    CAMPAIGNS ||--o{ DONATIONS : "receives"
    
    DONATIONS ||--o{ PAYMENT_TRANSACTIONS : "has"

    VOLUNTEERS ||--o{ VOLUNTEER_ASSIGNMENTS : "assigned to"
    VOLUNTEERS ||--o{ VOLUNTEER_CERTIFICATES : "receives"

    VOLUNTEER_TASKS ||--o{ VOLUNTEER_ASSIGNMENTS : "has"

    BENEFICIARIES ||--o{ HELP_REQUESTS : "submits"
    
    HELP_REQUESTS ||--o{ HELP_REQUEST_DOCUMENTS : "has documents"

    EVENTS ||--o{ EVENT_REGISTRATIONS : "has attendees"
    EVENTS ||--o{ EVENT_GALLERY : "has images"
```

## Key Relationships Explanation

- **Users**: Central to the system. Different roles (donor, volunteer, beneficiary, ngo, admin) link a single user record to role-specific profiles (`ngo_profiles`, `volunteers`, `beneficiaries`).
- **Campaigns**: Associated with a `ngo_profile` (or NULL if admin-created) and a `category`. Donors make `donations` to `campaigns`.
- **Donations & Payments**: A 1-to-many relationship where a `donation` can have multiple `payment_transactions` (e.g., failed attempts before success).
- **Volunteering**: A `volunteer` is assigned to a `volunteer_task` via the `volunteer_assignments` junction table which also tracks hours and attendance.
- **Beneficiaries & Help Requests**: `beneficiaries` submit `help_requests` which hold status and are approved by admin `users`.
- **Events**: `users` register for `events` via `event_registrations`, which tracks both participants and volunteers for the event.
