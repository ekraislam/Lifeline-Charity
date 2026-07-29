require('dotenv').config();
const db = require('./src/config/db');

(async () => {
    try {
        await db.query('ALTER TABLE help_requests ADD COLUMN required_amount DECIMAL(15,2) DEFAULT 0.00');
        console.log('Added required_amount');
    } catch (e) { console.log('required_amount:', e.code || e.message); }

    try {
        await db.query('ALTER TABLE help_requests ADD COLUMN assigned_ngo_id INT DEFAULT NULL');
        console.log('Added assigned_ngo_id');
    } catch (e) { console.log('assigned_ngo_id:', e.code || e.message); }

    try {
        await db.query(`ALTER TABLE help_requests MODIFY COLUMN status ENUM('pending','under_review','approved','rejected','waiting_for_ngo','assigned','campaign_active','fulfilled') DEFAULT 'pending'`);
        console.log('Updated status enum');
    } catch (e) { console.log('status:', e.code || e.message); }

    try {
        await db.query('ALTER TABLE campaigns ADD COLUMN help_request_id INT DEFAULT NULL');
        console.log('Added help_request_id to campaigns');
    } catch (e) { console.log('help_request_id:', e.code || e.message); }

    process.exit(0);
})();
