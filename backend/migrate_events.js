const db = require('./src/config/db');

async function migrate() {
    try {
        console.log("Adding end_date column...");
        await db.query(`ALTER TABLE events ADD COLUMN end_date DATETIME NULL AFTER event_date`);
        console.log("Populating existing end_dates...");
        await db.query(`UPDATE events SET end_date = DATE_ADD(event_date, INTERVAL 2 HOUR) WHERE end_date IS NULL`);
        console.log("Migration completed successfully.");
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Column end_date already exists. Skipping.");
        } else {
            console.error("Migration failed:", err);
        }
    }
    process.exit(0);
}
migrate();
