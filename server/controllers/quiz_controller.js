// I handle all quiz-related database operations
const db = require('../database/connection');


async function createQuiz(req, res) {
    // I used a transaction to make sure both the quiz and questions are saved together
    const client = await db.getClient();

    try {
        const userId = req.userId;
        const { title, difficulty, type, questions, folderId } = req.body;

        if (!title || !difficulty || !questions || questions.length === 0) {
            return res.status(400).json({
                error: 'Please provide title, difficulty, and questions'
            });
        }

        await client.query('BEGIN');


        const quizResult = await client.query(
            `INSERT INTO quizzes (user_id, folder_id, title, difficulty, type)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, title, difficulty, type, created_at`,
            [userId, folderId || null, title, difficulty, type || 'prompt']
        );

        const quiz = quizResult.rows[0];

        const questionPromises = questions.map((q, index) => {
            return client.query(
                `INSERT INTO questions (quiz_id, question_number, question_text, options, correct_answer)
                 VALUES ($1, $2, $3, $4, $5)`,
                [quiz.id, index + 1, q.question, JSON.stringify(q.options), q.correctAnswer]
            );
        });

        await Promise.all(questionPromises);

        await client.query('COMMIT');


        res.status(201).json({
            message: 'Quiz created successfully!',
            quiz: {
                id: quiz.id,
                title: quiz.title,
                difficulty: quiz.difficulty,
                type: quiz.type,
                questionCount: questions.length,
                createdAt: quiz.created_at
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Failed to create quiz' });

    } finally {
        client.release();
    }
}



async function getUserQuizzes(req, res) {
    try {
        const userId = req.userId;

        const result = await db.query(
            `SELECT
                q.id,
                q.title,
                q.difficulty,
                q.type,
                q.created_at,
                COUNT(qs.id) as question_count,
                f.name as folder_name
             FROM quizzes q
             LEFT JOIN questions qs ON q.id = qs.quiz_id
             LEFT JOIN folders f ON q.folder_id = f.id
             WHERE q.user_id = $1
             GROUP BY q.id, f.name
             ORDER BY q.created_at DESC`,
            [userId]
        );


        const quizzes = result.rows.map(quiz => ({
            id: quiz.id,
            title: quiz.title,
            difficulty: quiz.difficulty,
            type: quiz.type,
            questionCount: parseInt(quiz.question_count),
            folderName: quiz.folder_name,
            createdAt: quiz.created_at
        }));

        res.json({ quizzes });

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
}


async function getQuizById(req, res) {
    try {
        const userId = req.userId;
        const quizId = req.params.id;

        const quizResult = await db.query(
            `SELECT id, title, difficulty, type, created_at
             FROM quizzes
             WHERE id = $1 AND user_id = $2`,
            [quizId, userId]
        );

        if (quizResult.rows.length === 0) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        const quiz = quizResult.rows[0];


        const questionsResult = await db.query(
            `SELECT id, question_number, question_text, options, correct_answer
             FROM questions
             WHERE quiz_id = $1
             ORDER BY question_number`,
            [quizId]
        );

        const questions = questionsResult.rows.map(q => ({
            id: q.id,
            questionNumber: q.question_number,
            question: q.question_text,
            options: q.options,
            correctAnswer: q.correct_answer
        }));

        res.json({
            id: quiz.id,
            title: quiz.title,
            difficulty: quiz.difficulty,
            type: quiz.type,
            createdAt: quiz.created_at,
            questions
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
}



async function submitQuizResult(req, res) {
    try {
        const userId = req.userId;
        const quizId = req.params.id;
        const { userAnswers, timeSpent } = req.body;

        if (!userAnswers || !Array.isArray(userAnswers)) {
            return res.status(400).json({ error: 'Invalid answers format' });
        }

        const questionsResult = await db.query(
            `SELECT id, correct_answer
             FROM questions
             WHERE quiz_id = $1
             ORDER BY question_number`,
            [quizId]
        );

        const questions = questionsResult.rows;
        const totalQuestions = questions.length;


        let correctAnswers = 0;
        questions.forEach((q, index) => {
            if (userAnswers[index] === q.correct_answer) {
                correctAnswers++;
            }
        });

        const score = Math.round((correctAnswers / totalQuestions) * 100);

        const resultInsert = await db.query(
            `INSERT INTO quiz_results
             (user_id, quiz_id, score, correct_answers, total_questions, user_answers, time_spent)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, completed_at`,
            [userId, quizId, score, correctAnswers, totalQuestions, JSON.stringify(userAnswers), timeSpent || 0]
        );

        const result = resultInsert.rows[0];


        res.json({
            message: 'Quiz submitted successfully!',
            resultId: result.id,
            score,
            correctAnswers,
            totalQuestions,
            completedAt: result.completed_at
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
}


async function getQuizResults(req, res) {
    try {
        const userId = req.userId;
        const quizId = req.params.id;

        const result = await db.query(
            `SELECT
                qr.id,
                qr.score,
                qr.correct_answers,
                qr.total_questions,
                qr.user_answers,
                qr.time_spent,
                qr.completed_at,
                q.title as quiz_title
             FROM quiz_results qr
             JOIN quizzes q ON qr.quiz_id = q.id
             WHERE qr.quiz_id = $1 AND qr.user_id = $2
             ORDER BY qr.completed_at DESC`,
            [quizId, userId]
        );


        const results = result.rows.map(r => ({
            id: r.id,
            quizTitle: r.quiz_title,
            score: r.score,
            correctAnswers: r.correct_answers,
            totalQuestions: r.total_questions,
            userAnswers: r.user_answers,
            timeSpent: r.time_spent,
            completedAt: r.completed_at
        }));

        res.json({ results });

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch results' });
    }
}



async function deleteQuiz(req, res) {
    try {
        const userId = req.userId;
        const quizId = req.params.id;

        const result = await db.query(
            'DELETE FROM quizzes WHERE id = $1 AND user_id = $2 RETURNING id',
            [quizId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.json({ message: 'Quiz deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Failed to delete quiz' });
    }
}


module.exports = {
    createQuiz,
    getUserQuizzes,
    getQuizById,
    submitQuizResult,
    getQuizResults,
    deleteQuiz
};
