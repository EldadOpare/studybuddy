const express = require('express');
const router = express.Router();

const quizController = require('../controllers/quiz_controller');
const { requireAuth } = require('../middleware/auth_middleware');


router.use(requireAuth);

router.post('/', quizController.createQuiz);

router.get('/', quizController.getUserQuizzes);


router.get('/:id', quizController.getQuizById);

router.post('/:id/submit', quizController.submitQuizResult);

router.get('/:id/results', quizController.getQuizResults);

router.delete('/:id', quizController.deleteQuiz);


module.exports = router;
