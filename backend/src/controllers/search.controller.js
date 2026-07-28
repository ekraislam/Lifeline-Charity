const searchService = require('../services/search.service');

const globalSearch = async (req, res) => {
    try {
        const { q, category_id, status, location } = req.query;
        const results = await searchService.globalSearch(q, category_id, status, location);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { globalSearch };
