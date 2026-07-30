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

        // Step 3: Ensure default categories exist
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
    } catch (error) {
        console.error("Auto database initialization warning/error:", error.message);
    }
};

module.exports = initDb;
