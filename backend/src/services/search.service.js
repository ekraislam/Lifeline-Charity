const db = require('../config/db');

const globalSearch = async (query, categoryId, status, location) => {
    let results = {
        campaigns: [],
        events: []
    };

    if (query) {
        let campaignQuery = 'SELECT * FROM campaigns WHERE title LIKE ? OR description LIKE ?';
        let campaignParams = [`%${query}%`, `%${query}%`];
        
        if (categoryId) {
            campaignQuery += ' AND category_id = ?';
            campaignParams.push(categoryId);
        }
        if (status) {
            campaignQuery += ' AND status = ?';
            campaignParams.push(status);
        }

        const [campaigns] = await db.query(campaignQuery, campaignParams);
        results.campaigns = campaigns;

        let eventQuery = 'SELECT * FROM events WHERE title LIKE ? OR description LIKE ?';
        let eventParams = [`%${query}%`, `%${query}%`];
        
        if (location) {
            eventQuery += ' AND location LIKE ?';
            eventParams.push(`%${location}%`);
        }

        const [events] = await db.query(eventQuery, eventParams);
        results.events = events;
    }

    return results;
};

module.exports = { globalSearch };
