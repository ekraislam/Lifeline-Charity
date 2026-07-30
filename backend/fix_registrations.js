const db = require('./src/config/db');

async function fix() {
    await db.query(`UPDATE event_registrations SET attendance_status = 'pending' WHERE attendance_status = '' OR attendance_status IS NULL`);
    const [rows] = await db.query('SELECT * FROM event_registrations');
    console.log("Updated rows:", rows);
    process.exit(0);
}
fix();
