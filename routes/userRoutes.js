const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/wishlist', protect, userController.getWishlist);
router.post('/wishlist', protect, userController.addToWishlist);
router.delete('/wishlist/:steamAppID', protect, userController.removeFromWishlist);

module.exports = router;
