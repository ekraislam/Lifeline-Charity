const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const initDb = async () => {
    const host = process.env.DB_HOST || '127.0.0.1';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'lifeline_db';

    try {
        // Step 1: Ensure database exists
        const connection = await mysql.createConnection({ host, user, password, multipleStatements: true });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        await connection.end();

        // Step 2: Connect to the target DB pool & check tables
        const dbPool = require('./db');
        const [tables] = await dbPool.query("SHOW TABLES LIKE 'users'");
        
        if (tables.length === 0) {
            console.log(`Database '${database}' is empty. Initializing tables...`);
            const schemaPath = path.join(__dirname, '../../schema.sql');
            const initAdminPath = path.join(__dirname, '../../init-admin.sql');

            const setupConn = await mysql.createConnection({ host, user, password, database, multipleStatements: true });

            if (fs.existsSync(schemaPath)) {
                const schemaSql = fs.readFileSync(schemaPath, 'utf8');
                await setupConn.query(schemaSql);
                console.log("Database schema initialized successfully.");
            }

            if (fs.existsSync(initAdminPath)) {
                const adminSql = fs.readFileSync(initAdminPath, 'utf8');
                await setupConn.query(adminSql);
                console.log("Admin user initialized successfully.");
            }
            await setupConn.end();
        } else {
            console.log(`Database '${database}' connected and verified.`);
        }

        // Ensure ai_verification_reports table exists
        await dbPool.query(`
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
        `);

        // Check and ensure columns risk_level and reason_for_risk exist and are updated
        try {
            await dbPool.query(`ALTER TABLE ai_verification_reports MODIFY COLUMN risk_level VARCHAR(50) DEFAULT 'Not Analyzed'`);
        } catch (e) {}
        try {
            const [reasonCol] = await dbPool.query(
                `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'ai_verification_reports' AND COLUMN_NAME = 'reason_for_risk'`,
                [database]
            );
            if (reasonCol.length === 0) {
                await dbPool.query(`ALTER TABLE ai_verification_reports ADD COLUMN reason_for_risk TEXT AFTER risk_level`);
            }
        } catch (e) {}


        // Ensure help_requests payment columns exist (compatible with all MySQL versions)
        try {
            const dbName = database;
            const paymentCols = [
                { column: 'payment_method',      definition: "ENUM('Bank Transfer','bKash','Nagad','Rocket') DEFAULT 'Bank Transfer'" },
                { column: 'account_holder_name', definition: 'VARCHAR(255)' },
                { column: 'account_number',      definition: 'VARCHAR(255)' },
            ];
            for (const col of paymentCols) {
                const [colRows] = await dbPool.query(
                    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
                     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'help_requests' AND COLUMN_NAME = ?`,
                    [dbName, col.column]
                );
                if (colRows.length === 0) {
                    await dbPool.query(`ALTER TABLE help_requests ADD COLUMN ${col.column} ${col.definition}`);
                    console.log(`Added column help_requests.${col.column}`);
                }
            }
        } catch (colErr) {
            console.warn("Payment columns check warning:", colErr.message);
        }

        // Ensure campaigns status ENUM supports target_reached, processing_payout, withdrawn
        try {
            await dbPool.query(`
                ALTER TABLE campaigns 
                MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'target_reached', 'processing_payout', 'completed', 'cancelled', 'withdrawn') DEFAULT 'pending';
            `);
        } catch (e) {}

        // Ensure campaigns withdrawal columns exist
        try {
            const dbName = database;
            const campaignCols = [
                { column: 'withdrawal_reason', definition: 'TEXT NULL' },
                { column: 'withdrawn_at',      definition: 'DATETIME NULL' },
            ];
            for (const col of campaignCols) {
                const [colRows] = await dbPool.query(
                    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
                     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'campaigns' AND COLUMN_NAME = ?`,
                    [dbName, col.column]
                );
                if (colRows.length === 0) {
                    await dbPool.query(`ALTER TABLE campaigns ADD COLUMN ${col.column} ${col.definition}`);
                    console.log(`Added column campaigns.${col.column}`);
                }
            }
        } catch (colErr) {
            console.warn("Campaign withdrawal columns check warning:", colErr.message);
        }


        // Ensure campaign_payouts table exists
        await dbPool.query(`
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
        `);

        // Ensure status column and transaction_id column modifications in existing table
        try {
            await dbPool.query(`
                ALTER TABLE campaign_payouts 
                MODIFY COLUMN status ENUM('Pending', 'Under Review', 'Approved', 'Rejected', 'Completed', 'Paid', 'Confirmed', 'Failed') DEFAULT 'Pending',
                MODIFY COLUMN transaction_id VARCHAR(255) NULL;
            `);
        } catch (e) {}

        try {
            const [adminNoteCol] = await dbPool.query(
                `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'campaign_payouts' AND COLUMN_NAME = 'admin_notes'`,
                [database]
            );
            if (adminNoteCol.length === 0) {
                await dbPool.query(`ALTER TABLE campaign_payouts ADD COLUMN admin_notes TEXT`);
            }
        } catch (e) {}

        // Ensure activity_logs table exists
        await dbPool.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                user_name VARCHAR(255) DEFAULT 'System User',
                user_role VARCHAR(50) DEFAULT 'User',
                activity_type VARCHAR(100) NOT NULL,
                activity_title VARCHAR(255) NOT NULL,
                activity_description TEXT,
                related_id INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Ensure ngo_request_decisions table exists
        await dbPool.query(`
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
        `);
        const [cats] = await dbPool.query("SELECT COUNT(*) as count FROM categories");
        if (cats[0].count === 0) {
            console.log("Seeding default categories...");
            await dbPool.query(`
                INSERT INTO categories (id, name, type) VALUES
                (1, 'Education', 'campaign'),
                (2, 'Health', 'campaign'),
                (3, 'Disaster Relief', 'campaign'),
                (4, 'Environment', 'campaign'),
                (5, 'General', 'campaign')
                ON DUPLICATE KEY UPDATE name=VALUES(name);
            `);
            console.log("Default categories seeded successfully.");
        }

        // Sync help_requests status & unassign NGO if campaign is missing, deleted, or withdrawn
        try {
            // Explicitly set rejected status for requests whose campaigns were deleted by Admin
            await dbPool.query(`
                UPDATE help_requests
                SET status = 'rejected', assigned_ngo_id = NULL, admin_note = COALESCE(admin_note, 'Associated campaign was permanently deleted by Admin')
                WHERE id IN (8, 10) 
                   OR admin_note LIKE '%deleted by Admin%' 
                   OR admin_note LIKE '%permanently deleted%'
            `);

            await dbPool.query(`
                UPDATE help_requests hr
                LEFT JOIN campaigns c ON c.help_request_id = hr.id AND c.status NOT IN ('cancelled', 'withdrawn')
                SET hr.assigned_ngo_id = NULL,
                    hr.status = CASE 
                        WHEN hr.id IN (8, 10) OR hr.admin_note LIKE '%deleted by Admin%' OR hr.status = 'rejected' THEN 'rejected' 
                        ELSE hr.status
                    END
                WHERE c.id IS NULL
            `);

            // Unassign help_requests where assigned NGO has a declined decision
            await dbPool.query(`
                UPDATE help_requests hr
                JOIN ngo_request_decisions nrd ON nrd.help_request_id = hr.id AND nrd.ngo_id = hr.assigned_ngo_id AND nrd.action = 'declined'
                SET hr.assigned_ngo_id = NULL, 
                    hr.status = CASE WHEN hr.status = 'rejected' THEN 'rejected' ELSE 'waiting_for_ngo' END
                WHERE hr.assigned_ngo_id IS NOT NULL
            `);
        } catch (syncErr) {
            console.warn("Status sync warning:", syncErr.message);
        }
    } catch (error) {







        console.error("Auto database initialization warning/error:", error.message);
    }
};

module.exports = initDb;
