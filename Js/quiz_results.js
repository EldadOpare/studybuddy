// Logout function
function logout() {
    window.location.href = 'login.html';
}

// Run when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Quiz results page loaded');

    // Load quiz results
    loadResults();

    // Set up event listeners
    setupEventListeners();
});

function loadResults() {
    // Get quiz results from localStorage
    const resultData = localStorage.getItem('current_quiz_result');

    if (!resultData) {
        console.error('No quiz result found');
        window.location.href = 'quizzes.html';
        return;
    }

    const result = JSON.parse(resultData);

    // Update page title
    document.getElementById('quizTitle').textContent = result.quizTitle;

    // Update score circle
    updateScoreCircle(result.score);

    // Update score percentage
    document.getElementById('scorePercentage').textContent = `${result.score}%`;

    // Update summary stats
    document.getElementById('correctCount').textContent = result.correctAnswers;
    document.getElementById('incorrectCount').textContent = result.totalQuestions - result.correctAnswers;
    document.getElementById('timeSpent').textContent = formatTime(result.timeSpent);

    // Format date
    const dateOptions = { month: 'short', day: 'numeric' };
    const completedDate = new Date(result.completedAt);
    document.getElementById('dateTaken').textContent = completedDate.toLocaleDateString('en-US', dateOptions);

    // Populate questions review
    populateQuestionsReview(result);
}

function updateScoreCircle(score) {
    const circle = document.getElementById('scoreProgress');
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = offset;

    // Change color based on score
    if (score >= 80) {
        circle.style.stroke = '#38a169'; // Green
    } else if (score >= 60) {
        circle.style.stroke = '#018790'; // Teal
    } else if (score >= 40) {
        circle.style.stroke = '#ecc94b'; // Yellow
    } else {
        circle.style.stroke = '#e53e3e'; // Red
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function populateQuestionsReview(result) {
    const container = document.getElementById('questionsReview');
    container.innerHTML = '';

    result.questions.forEach((question, index) => {
        const userAnswer = result.answers[index];
        const correctAnswer = question.correctAnswer;
        const isCorrect = userAnswer === correctAnswer;

        const card = document.createElement('div');
        card.className = `question_review_card ${isCorrect ? 'correct' : 'incorrect'}`;

        // Question header
        const header = document.createElement('div');
        header.className = 'question_header';

        const questionInfo = document.createElement('div');
        questionInfo.className = 'question_info';

        const questionNumber = document.createElement('div');
        questionNumber.className = 'question_number';
        questionNumber.textContent = `Question ${index + 1}`;

        const questionText = document.createElement('div');
        questionText.className = 'question_text';
        questionText.textContent = question.question;

        questionInfo.appendChild(questionNumber);
        questionInfo.appendChild(questionText);

        const status = document.createElement('div');
        status.className = `question_status ${isCorrect ? 'correct' : 'incorrect'}`;
        status.textContent = isCorrect ? 'Correct' : 'Incorrect';

        header.appendChild(questionInfo);
        header.appendChild(status);

        // Options review
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options_review';

        question.options.forEach((option, optionIndex) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option_review';

            // Determine option styling
            if (optionIndex === correctAnswer) {
                optionDiv.classList.add('correct_answer');
            }

            if (userAnswer !== null && optionIndex === userAnswer) {
                optionDiv.classList.add('user_answer');
                if (!isCorrect) {
                    optionDiv.classList.add('wrong');
                }
            }

            const letter = document.createElement('div');
            letter.className = 'option_letter';
            letter.textContent = String.fromCharCode(65 + optionIndex);

            const content = document.createElement('div');
            content.className = 'option_content';

            const text = document.createElement('div');
            text.className = 'option_text';
            text.textContent = option;

            content.appendChild(text);

            // Add badges
            if (optionIndex === correctAnswer) {
                const badge = document.createElement('span');
                badge.className = 'option_badge correct_badge';
                badge.textContent = 'Correct Answer';
                content.appendChild(badge);
            }

            if (userAnswer !== null && optionIndex === userAnswer && userAnswer !== correctAnswer) {
                const badge = document.createElement('span');
                badge.className = 'option_badge wrong_badge';
                badge.textContent = 'Your Answer';
                content.appendChild(badge);
            }

            if (userAnswer !== null && optionIndex === userAnswer && userAnswer === correctAnswer) {
                const badge = document.createElement('span');
                badge.className = 'option_badge your_answer_badge';
                badge.textContent = 'Your Answer';
                content.appendChild(badge);
            }

            optionDiv.appendChild(letter);
            optionDiv.appendChild(content);

            optionsContainer.appendChild(optionDiv);
        });

        card.appendChild(header);
        card.appendChild(optionsContainer);

        container.appendChild(card);
    });
}

function setupEventListeners() {
    // Retake quiz button
    document.getElementById('retakeQuizButton').addEventListener('click', function() {
        // Clear current result and redirect to quiz page
        const result = JSON.parse(localStorage.getItem('current_quiz_result'));
        localStorage.removeItem('current_quiz_result');

        // TODO: In production, this would redirect to the actual quiz with the quiz ID
        window.location.href = 'take_quiz.html';
    });

    // Back to quizzes button
    document.getElementById('backToQuizzesButton').addEventListener('click', function() {
        localStorage.removeItem('current_quiz_result');
        window.location.href = 'quizzes.html';
    });
}
