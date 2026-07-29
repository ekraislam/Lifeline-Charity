const express = require('express');
const router = express.Router();
const c = require('../controllers/category.controller');

router.get('/', c.getCategories);

module.exports = router;
