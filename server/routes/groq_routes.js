


// I set up routes for AI features using Groq - the chatbot and quiz generation

const express = require('express');

const router = express.Router();

const groqController = require('../controllers/groq_controller');

const { requireAuth } = require('../middleware/auth_middleware');

// I left the chat route public so anyone can talk to Buddy the chatbot
router.post('/chat', groqController.chat);

// I required authentication for quiz generation since it's a logged-in user feature
router.use(requireAuth);

router.post('/generate-from-topic', groqController.generateFromTopic);

router.post('/generate-from-text', groqController.generateFromText);


module.exports = router;
