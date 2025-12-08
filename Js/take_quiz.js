// Logout function
function logout() {
    window.location.href = 'login.html';
}

// Sample quiz data (will be replaced with actual data from Groq AI)
const sampleQuiz = {
    id: 'quiz_001',
    title: 'Biology 101 - Cell Structure',
    difficulty: 'Medium',
    questions: [
        {
            id: 1,
            question: 'What is the powerhouse of the cell?',
            options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Endoplasmic Reticulum'],
            correctAnswer: 1
        },
        {
            id: 2,
            question: 'Which organelle is responsible for protein synthesis?',
            options: ['Golgi Apparatus', 'Lysosome', 'Ribosome', 'Vacuole'],
            correctAnswer: 2
        },
        {
            id: 3,
            question: 'What contains the genetic material of the cell?',
            options: ['Nucleus', 'Cytoplasm', 'Cell Membrane', 'Mitochondria'],
            correctAnswer: 0
        },
        {
            id: 4,
            question: 'Which structure controls what enters and leaves the cell?',
            options: ['Cell Wall', 'Cell Membrane', 'Nucleus', 'Cytoplasm'],
            correctAnswer: 1
        },
        {
            id: 5,
            question: 'What is the jelly-like substance inside the cell?',
            options: ['Nucleus', 'Vacuole', 'Cytoplasm', 'Chloroplast'],
            correctAnswer: 2
        },
        {
            id: 6,
            question: 'Which organelle is found only in plant cells?',
            options: ['Mitochondria', 'Chloroplast', 'Ribosome', 'Nucleus'],
            correctAnswer: 1
        },
        {
            id: 7,
            question: 'What packages and distributes proteins in the cell?',
            options: ['Golgi Apparatus', 'Endoplasmic Reticulum', 'Lysosome', 'Peroxisome'],
            correctAnswer: 0
        },
        {
            id: 8,
            question: 'Which organelle breaks down waste materials?',
            options: ['Ribosome', 'Vacuole', 'Lysosome', 'Chloroplast'],
            correctAnswer: 2
        },
        {
            id: 9,
            question: 'What is the site of photosynthesis in plant cells?',
            options: ['Mitochondria', 'Chloroplast', 'Nucleus', 'Vacuole'],
            correctAnswer: 1
        },
        {
            id: 10,
            question: 'Which organelle stores water and nutrients?',
            options: ['Lysosome', 'Ribosome', 'Vacuole', 'Golgi Apparatus'],
            correctAnswer: 2
        }
    ]
};

// Quiz state
let currentQuestionIndex = 0;
let userAnswers = [];
let startTime = null;
let timerInterval = null;

// Run when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Quiz page loaded');

    // Initialize quiz
    initializeQuiz();

    // Set up event listeners
    setupEventListeners();

    // Start timer
    startTimer();
});

function initializeQuiz() {
    // Try to load quiz from localStorage first
    const storedQuiz = localStorage.getItem('current_quiz');
    if (storedQuiz) {
        const parsedQuiz = JSON.parse(storedQuiz);
        // Update sampleQuiz with the loaded quiz
        Object.assign(sampleQuiz, parsedQuiz);
    }

    // Initialize user answers array
    userAnswers = new Array(sampleQuiz.questions.length).fill(null);

    // Update quiz header
    document.getElementById('quizTitle').textContent = sampleQuiz.title;

    // Capitalize difficulty
    const difficultyText = sampleQuiz.difficulty.charAt(0).toUpperCase() + sampleQuiz.difficulty.slice(1);
    document.getElementById('quizMeta').textContent = `${sampleQuiz.questions.length} Questions • ${difficultyText} Difficulty`;

    // Load first question
    loadQuestion(0);
}

function loadQuestion(index) {
    currentQuestionIndex = index;
    const question = sampleQuiz.questions[index];

    // Update question number and text
    document.getElementById('questionNumber').textContent = `Question ${index + 1}`;
    document.getElementById('questionText').textContent = question.question;

    // Update progress
    updateProgress();

    // Load options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, i) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option_item';
        optionElement.dataset.option = String.fromCharCode(65 + i); // A, B, C, D

        // Check if this option was previously selected
        if (userAnswers[index] === i) {
            optionElement.classList.add('selected');
        }

        optionElement.innerHTML = `
            <div class="option_label">${String.fromCharCode(65 + i)}</div>
            <div class="option_text">${option}</div>
        `;

        optionElement.addEventListener('click', function() {
            selectOption(i);
        });

        optionsContainer.appendChild(optionElement);
    });

    // Update navigation buttons
    updateNavigationButtons();
}

function selectOption(optionIndex) {
    // Save the answer
    userAnswers[currentQuestionIndex] = optionIndex;

    // Update UI
    const optionItems = document.querySelectorAll('.option_item');
    optionItems.forEach((item, index) => {
        if (index === optionIndex) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });

    console.log('Selected option:', optionIndex, 'for question', currentQuestionIndex + 1);
}

function updateProgress() {
    const totalQuestions = sampleQuiz.questions.length;
    const currentQuestion = currentQuestionIndex + 1;
    const progressPercentage = (currentQuestion / totalQuestions) * 100;

    document.getElementById('progressText').textContent = `Question ${currentQuestion} of ${totalQuestions}`;
    document.getElementById('progressBar').style.width = `${progressPercentage}%`;
}

function updateNavigationButtons() {
    const previousButton = document.getElementById('previousButton');
    const nextButton = document.getElementById('nextButton');

    // Update Previous button
    if (currentQuestionIndex === 0) {
        previousButton.disabled = true;
    } else {
        previousButton.disabled = false;
    }

    // Update Next button text
    if (currentQuestionIndex === sampleQuiz.questions.length - 1) {
        nextButton.textContent = 'Submit Quiz';
    } else {
        nextButton.textContent = 'Next';
    }
}

function startTimer() {
    startTime = Date.now();

    timerInterval = setInterval(function() {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;

        document.getElementById('timeText').textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function setupEventListeners() {
    // Previous button
    document.getElementById('previousButton').addEventListener('click', function() {
        if (currentQuestionIndex > 0) {
            loadQuestion(currentQuestionIndex - 1);
        }
    });

    // Next button
    document.getElementById('nextButton').addEventListener('click', function() {
        if (currentQuestionIndex < sampleQuiz.questions.length - 1) {
            loadQuestion(currentQuestionIndex + 1);
        } else {
            // Last question - show submit confirmation
            showSubmitConfirmation();
        }
    });

    // Exit quiz button
    document.getElementById('exitQuizButton').addEventListener('click', function() {
        showExitConfirmation();
    });

    // Exit confirmation modal
    const exitConfirmModal = document.getElementById('exitConfirmModal');
    const closeExitModal = document.getElementById('closeExitModal');
    const cancelExitButton = document.getElementById('cancelExitButton');
    const confirmExitButton = document.getElementById('confirmExitButton');

    closeExitModal.addEventListener('click', function() {
        exitConfirmModal.style.display = 'none';
    });

    cancelExitButton.addEventListener('click', function() {
        exitConfirmModal.style.display = 'none';
    });

    confirmExitButton.addEventListener('click', function() {
        // Save progress and exit
        saveProgress();
        window.location.href = 'quizzes.html';
    });

    exitConfirmModal.addEventListener('click', function(e) {
        if (e.target === exitConfirmModal) {
            exitConfirmModal.style.display = 'none';
        }
    });

    // Submit confirmation modal
    const submitConfirmModal = document.getElementById('submitConfirmModal');
    const closeSubmitModal = document.getElementById('closeSubmitModal');
    const cancelSubmitButton = document.getElementById('cancelSubmitButton');
    const confirmSubmitButton = document.getElementById('confirmSubmitButton');

    closeSubmitModal.addEventListener('click', function() {
        submitConfirmModal.style.display = 'none';
    });

    cancelSubmitButton.addEventListener('click', function() {
        submitConfirmModal.style.display = 'none';
    });

    confirmSubmitButton.addEventListener('click', function() {
        submitQuiz();
    });

    submitConfirmModal.addEventListener('click', function(e) {
        if (e.target === submitConfirmModal) {
            submitConfirmModal.style.display = 'none';
        }
    });
}

function showExitConfirmation() {
    document.getElementById('exitConfirmModal').style.display = 'flex';
}

function showSubmitConfirmation() {
    const answeredCount = userAnswers.filter(answer => answer !== null).length;
    const totalQuestions = sampleQuiz.questions.length;

    const confirmText = `You have answered ${answeredCount} out of ${totalQuestions} questions. Are you sure you want to submit?`;
    document.getElementById('submitConfirmText').textContent = confirmText;

    document.getElementById('submitConfirmModal').style.display = 'flex';
}

function saveProgress() {
    // Save quiz progress to localStorage
    const progress = {
        quizId: sampleQuiz.id,
        currentQuestion: currentQuestionIndex,
        answers: userAnswers,
        startTime: startTime,
        lastUpdated: Date.now()
    };

    localStorage.setItem('quiz_progress_' + sampleQuiz.id, JSON.stringify(progress));
    console.log('Progress saved');
}

function submitQuiz() {
    // Stop timer
    clearInterval(timerInterval);

    // Calculate score
    let correctAnswers = 0;
    sampleQuiz.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswer) {
            correctAnswers++;
        }
    });

    const score = Math.round((correctAnswers / sampleQuiz.questions.length) * 100);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    // Save quiz results
    const result = {
        quizId: sampleQuiz.id,
        quizTitle: sampleQuiz.title,
        score: score,
        correctAnswers: correctAnswers,
        totalQuestions: sampleQuiz.questions.length,
        timeSpent: timeSpent,
        answers: userAnswers,
        questions: sampleQuiz.questions,
        completedAt: new Date().toISOString(),
        dateTaken: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    };

    // Store result in localStorage
    const existingResults = JSON.parse(localStorage.getItem('quiz_results') || '[]');
    existingResults.push(result);
    localStorage.setItem('quiz_results', JSON.stringify(existingResults));

    // Clear progress
    localStorage.removeItem('quiz_progress_' + sampleQuiz.id);

    // Redirect to results page
    localStorage.setItem('current_quiz_result', JSON.stringify(result));
    window.location.href = 'quiz_results.html';
}
