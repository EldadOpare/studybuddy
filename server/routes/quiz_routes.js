// I set up all quiz routes for creating, viewing, submitting, and deleting quizzes
const express = require('express');

const router = express.Router();

const quizController = require('../controllers/quiz_controller');

const { requireAuth } = require('../middleware/auth_middleware');

// I required authentication for all quiz routes
router.use(requireAuth);

router.post('/', quizController.createQuiz);

router.get('/', quizController.getUserQuizzes);

router.get('/:id', quizController.getQuizById);

router.post('/:id/submit', quizController.submitQuizResult);

router.get('/:id/results', quizController.getQuizResults);

router.delete('/:id', quizController.deleteQuiz);


module.exports = router;
