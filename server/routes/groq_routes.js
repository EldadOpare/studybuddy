const express = require('express');
const router = express.Router();
const groqController = require('../controllers/groq_controller');
const { requireAuth } = require('../middleware/auth_middleware');


router.use(requireAuth);

router.post('/generate-from-topic', groqController.generateFromTopic);

router.post('/generate-from-text', groqController.generateFromText);


module.exports = router;
