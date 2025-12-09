const express = require('express');
const router = express.Router();

const userController = require('../controllers/user_controller');
const { requireAuth } = require('../middleware/auth_middleware');


router.use(requireAuth);

router.put('/profile', userController.updateProfile);
router.put('/password', userController.changePassword);
router.get('/stats', userController.getUserStats);


module.exports = router;
