const db = require('../config/db');

exports.getCategories = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories');
        res.json(rows);
    } catch (error) {
        console.error("Categories fetch error:", error);
        res.status(500).json({ message: "Server error while fetching categories." });
    }
};
