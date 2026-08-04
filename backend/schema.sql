-- Lifeline MySQL Database Schema
-- Run this script to generate the database and tables.

CREATE DATABASE IF NOT EXISTS lifeline_db;
USE lifeline_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('donor', 'volunteer', 'beneficiary', 'ngo', 'admin', 'guest') NOT NULL DEFAULT 'guest',
    phone VARCHAR(50),
    address TEXT,
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. NGO Profiles
CREATE TABLE IF NOT EXISTS ngo_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    registration_number VARCHAR(100) UNIQUE,
    org_name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    documents TEXT,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Categories (Reusable)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50), -- e.g., 'campaign', 'event'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ngo_id INT, -- can be null if created by admin
    category_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    goal_amount DECIMAL(15, 2) NOT NULL,
    raised_amount DECIMAL(15, 2) DEFAULT 0.00,
    deadline DATETIME,
    status ENUM('pending', 'approved', 'rejected', 'target_reached', 'processing_payout', 'completed', 'cancelled', 'withdrawn') DEFAULT 'pending',
    is_featured BOOLEAN DEFAULT FALSE,
    help_request_id INT,
    withdrawal_reason TEXT,
    withdrawn_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ngo_id) REFERENCES ngo_profiles(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 5. Campaign Gallery
CREATE TABLE IF NOT EXISTS campaign_gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- 6. Donations
CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT, -- NULL if anonymous user
    campaign_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency ENUM('none', 'weekly', 'monthly', 'yearly') DEFAULT 'none',
    status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- 7. Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donation_id INT NOT NULL,
    gateway_name VARCHAR(100),
    transaction_id VARCHAR(255),
    gateway_response TEXT,
    status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
);

-- 8. Volunteers
CREATE TABLE IF NOT EXISTS volunteers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skills TEXT,
    availability TEXT,
    status ENUM('pending', 'approved', 'rejected', 'inactive', 'restricted') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Volunteer Tasks
CREATE TABLE IF NOT EXISTS volunteer_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    required_skills TEXT,
    status ENUM('open', 'assigned', 'in_progress', 'completed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 10. Volunteer Assignments (Hours tracking & Attendance)
CREATE TABLE IF NOT EXISTS volunteer_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    volunteer_id INT NOT NULL,
    task_id INT NOT NULL,
    attendance_status ENUM('present', 'absent', 'excused', 'pending') DEFAULT 'pending',
    hours_logged DECIMAL(5, 2) DEFAULT 0.00,
    assigned_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES volunteer_tasks(id) ON DELETE CASCADE
);

-- 11. Volunteer Certificates
CREATE TABLE IF NOT EXISTS volunteer_certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    volunteer_id INT NOT NULL,
    issue_date DATE NOT NULL,
    certificate_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE
);

-- 12. Beneficiaries
CREATE TABLE IF NOT EXISTS beneficiaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('individual', 'organization', 'community') DEFAULT 'individual',
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 13. Help Requests
CREATE TABLE IF NOT EXISTS help_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    beneficiary_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('pending', 'under_review', 'approved', 'rejected', 'waiting_for_ngo', 'assigned', 'campaign_active', 'fulfilled') DEFAULT 'pending',
    approved_by INT,
    admin_note TEXT,
    required_amount DECIMAL(15, 2),
    assigned_ngo_id INT,
    payment_method ENUM('Bank Transfer', 'bKash', 'Nagad', 'Rocket') DEFAULT 'Bank Transfer',
    account_holder_name VARCHAR(255),
    account_number VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_ngo_id) REFERENCES ngo_profiles(id) ON DELETE SET NULL
);

-- 14. Help Request Documents
CREATE TABLE IF NOT EXISTS help_request_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    help_request_id INT NOT NULL,
    document_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (help_request_id) REFERENCES help_requests(id) ON DELETE CASCADE
);

-- 15. Events
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT,
    location VARCHAR(255),
    max_volunteers INT,
    event_date DATETIME NOT NULL,
    end_date DATETIME,
    registration_deadline DATETIME,
    status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
    cover_image VARCHAR(255),
    organizer_id INT, -- user who organized it
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 16. Event Registrations & Attendance
CREATE TABLE IF NOT EXISTS event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('participant', 'volunteer') DEFAULT 'participant',
    attendance_status ENUM('pending', 'attended', 'absent') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 17. Event Gallery
CREATE TABLE IF NOT EXISTS event_gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 18. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 19. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 20. Feedback, Comments, Ratings
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- e.g., 'campaign', 'event'
    entity_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 21. Bookmarks / Wishlist
CREATE TABLE IF NOT EXISTS bookmarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- e.g., 'campaign'
    entity_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 22. Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 23. AI Verification Reports (Beneficiary Document Verification)
CREATE TABLE IF NOT EXISTS ai_verification_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    help_request_id INT NOT NULL UNIQUE,
    ocr_data JSON,
    nid_analysis JSON,
    medical_analysis JSON,
    missing_info JSON,
    suspicious_findings JSON,
    confidence_score INT DEFAULT 0,
    risk_level VARCHAR(50) DEFAULT 'Not Analyzed',
    reason_for_risk TEXT,
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (help_request_id) REFERENCES help_requests(id) ON DELETE CASCADE
);

-- 24. Campaign Payouts
CREATE TABLE IF NOT EXISTS campaign_payouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    beneficiary_id INT NOT NULL,
    ngo_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method ENUM('Bank Transfer', 'bKash', 'Nagad', 'Rocket') NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(255) NOT NULL,
    transaction_id VARCHAR(255) NULL,
    payment_proof VARCHAR(255),
    payment_date DATETIME,
    beneficiary_confirmed TINYINT(1) DEFAULT 0,
    beneficiary_confirmation_date DATETIME,
    notes TEXT,
    admin_notes TEXT,
    status ENUM('Pending', 'Under Review', 'Approved', 'Rejected', 'Completed', 'Paid', 'Confirmed', 'Failed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE,
    FOREIGN KEY (ngo_id) REFERENCES ngo_profiles(id) ON DELETE CASCADE
);
-- 25. NGO Request Decisions
CREATE TABLE IF NOT EXISTS ngo_request_decisions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    help_request_id INT NOT NULL,
    ngo_id INT NOT NULL,
    action ENUM('accepted', 'declined') NOT NULL,
    reason VARCHAR(255) NULL,
    custom_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (help_request_id) REFERENCES help_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (ngo_id) REFERENCES ngo_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ngo_request (help_request_id, ngo_id)
);
