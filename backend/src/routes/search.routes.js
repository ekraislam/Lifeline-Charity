const express = require('express');
const searchController = require('../controllers/search.controller');

const router = express.Router();

router.get('/', searchController.globalSearch);
router.get('/public-stats', searchController.getPublicStats);

module.exports = router;
