const db = require('./src/config/db');

async function migrate() {
    try {
        console.log("Adding documents column to ngo_profiles...");
        await db.query(`ALTER TABLE ngo_profiles ADD COLUMN documents TEXT NULL`);
        console.log("Migration completed successfully.");
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Column documents already exists. Skipping.");
        } else {
            console.error("Migration failed:", err);
        }
    }
    process.exit(0);
}
migrate();
