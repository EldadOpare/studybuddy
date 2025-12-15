
// I set up all the authentication routes for signup, login, and user info
const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth_controller');

const { requireAuth } = require('../middleware/auth_middleware');

// The public routes I had did not require authentication so that anyone can use them
router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.get('/me', requireAuth, authController.getCurrentUser);

module.exports = router;
