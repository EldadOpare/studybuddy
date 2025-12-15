


// I set up all the admin routes so only admins can access the dashboard and manage users

const express = require('express');

const router = express.Router();

const adminController = require('../controllers/admin_controller');

const { requireAuth } = require('../middleware/auth_middleware');

const { requireAdmin } = require('../middleware/role_middleware');

// I made sure all admin routes require both authentication and admin role
router.use(requireAuth);

router.use(requireAdmin);

router.get('/stats', adminController.getAdminStats);

router.get('/activity', adminController.getRecentActivity);

router.get('/users', adminController.getAllUsers);

router.get('/users/:userId', adminController.getUserDetails);

router.delete('/users/:userId', adminController.deleteUser);


module.exports = router;
