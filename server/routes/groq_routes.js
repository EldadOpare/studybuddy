const express = require('express');
const router = express.Router();
const groqController = require('../controllers/groq_controller');
const { requireAuth } = require('../middleware/auth_middleware');


// Chat endpoint doesn't require auth (public for widget)
router.post('/chat', groqController.chat);

// These routes require authentication
router.use(requireAuth);

router.post('/generate-from-topic', groqController.generateFromTopic);

router.post('/generate-from-text', groqController.generateFromText);


module.exports = router;
