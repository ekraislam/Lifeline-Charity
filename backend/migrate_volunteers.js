require('dotenv').config();
const db = require('./src/config/db');

(async () => {
    try {
        console.log('Migrating volunteers table...');
        
        // Temporarily expand ENUM to include everything to avoid data loss
        await db.query(`ALTER TABLE volunteers MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'active', 'inactive') DEFAULT 'pending'`);
        
        // Update existing 'active' to 'approved'
        await db.query(`UPDATE volunteers SET status = 'approved' WHERE status = 'active'`);
        
        // Finalize ENUM without 'active'
        await db.query(`ALTER TABLE volunteers MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'inactive') DEFAULT 'pending'`);
        
        console.log('Updated status enum for volunteers');
        console.log('Migration complete.');
    } catch (e) {
        console.error('Migration failed:', e.code || e.message);
    }
    process.exit(0);
})();
