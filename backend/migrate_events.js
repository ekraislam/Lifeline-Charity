const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lifeline_db'
};

async function migrateEvents() {
    let connection;
    try {
        console.log('Connecting to the database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected successfully.');

        console.log('Altering events table to add missing columns...');
        
        const alterQueries = [
            `ALTER TABLE events ADD COLUMN category_id INT AFTER description`,
            `ALTER TABLE events ADD CONSTRAINT fk_events_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL`,
            `ALTER TABLE events ADD COLUMN max_volunteers INT DEFAULT 0 AFTER location`,
            `ALTER TABLE events ADD COLUMN registration_deadline DATETIME AFTER event_date`,
            `ALTER TABLE events ADD COLUMN status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming' AFTER registration_deadline`,
            `ALTER TABLE events ADD COLUMN cover_image VARCHAR(255) AFTER status`
        ];

        for (const query of alterQueries) {
            try {
                await connection.query(query);
                console.log(`Executed: ${query}`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Column already exists, skipping...`);
                } else {
                    console.warn(`Warning on query execution: ${err.message}`);
                }
            }
        }

        console.log('Events migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed.');
        }
    }
}

migrateEvents();
