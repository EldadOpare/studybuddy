const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth_controller');
const { requireAuth } = require('../middleware/auth_middleware');


router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.get('/me', requireAuth, authController.getCurrentUser);


module.exports = router;
