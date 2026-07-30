const db = require('./src/config/db');

async function check() {
    const [rows] = await db.query('SELECT * FROM event_registrations');
    console.log(rows);
    process.exit(0);
}
check();
