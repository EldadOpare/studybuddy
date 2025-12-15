

// I set up user routes for profile management and account settings

const express = require('express');

const router = express.Router();

const userController = require('../controllers/user_controller');

const { requireAuth } = require('../middleware/auth_middleware');

// I required authentication for all user routes
router.use(requireAuth);

router.put('/profile', userController.updateProfile);

router.put('/password', userController.changePassword);

router.get('/stats', userController.getUserStats);

router.delete('/delete', userController.deleteAccount);


module.exports = router;
