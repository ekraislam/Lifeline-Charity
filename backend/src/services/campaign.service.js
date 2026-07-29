const db = require('../config/db');

const getCampaigns = async () => {
    const [rows] = await db.query(`
        SELECT c.*, (c.raised_amount / c.goal_amount) * 100 AS progress,
        (SELECT image_url FROM campaign_gallery cg WHERE cg.campaign_id = c.id LIMIT 1) as cover_image
        FROM campaigns c
    `);
    return rows.map(row => ({
        ...row,
        gallery: row.cover_image ? [row.cover_image] : []
    }));
};

const getCampaignById = async (id) => {
    const [rows] = await db.query('SELECT *, (raised_amount / goal_amount) * 100 AS progress FROM campaigns WHERE id = ?', [id]);
    const campaign = rows[0];
    if (campaign) {
        const [gallery] = await db.query('SELECT image_url FROM campaign_gallery WHERE campaign_id = ?', [id]);
        campaign.gallery = gallery.map(g => g.image_url);
    }
    return campaign;
};

const createCampaign = async (campaignData, userId) => {
    // Find NGO ID if user is NGO
    let ngoId = null;
    const [ngoRows] = await db.query('SELECT id FROM ngo_profiles WHERE user_id = ?', [userId]);
    if (ngoRows.length > 0) {
        ngoId = ngoRows[0].id;
    }

    const { title, description, category_id, goal_amount, deadline, is_featured } = campaignData;
    const [result] = await db.query(
        'INSERT INTO campaigns (ngo_id, category_id, title, description, goal_amount, deadline, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [ngoId, category_id || null, title, description, goal_amount, deadline || null, is_featured || false]
    );
    return result.insertId;
};

const updateCampaign = async (id, updateData) => {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(updateData[key]);
        }
    });

    if (fields.length === 0) return;
    values.push(id);

    await db.query(`UPDATE campaigns SET ${fields.join(', ')} WHERE id = ?`, values);
};

const deleteCampaign = async (id) => {
    await db.query('DELETE FROM campaigns WHERE id = ?', [id]);
};

const updateCampaignStatus = async (id, status) => {
    await db.query('UPDATE campaigns SET status = ? WHERE id = ?', [status, id]);
};

const addCampaignGallery = async (campaignId, imageUrls) => {
    if (!imageUrls || imageUrls.length === 0) return;
    
    const values = imageUrls.map(url => [campaignId, url]);
    await db.query('INSERT INTO campaign_gallery (campaign_id, image_url) VALUES ?', [values]);
};

module.exports = {
    getCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    updateCampaignStatus,
    addCampaignGallery
};
