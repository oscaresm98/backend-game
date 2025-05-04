const express = require('express');
const router = express.Router();
const dealController = require('../controllers/dealController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', dealController.getDeals);
router.get('/search', dealController.searchGames);

module.exports = router;