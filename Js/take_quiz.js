
if (!requireAuth()) {
    
}
let currentQuiz = null;


let currentQuestionIndex = 0;

let userAnswers = [];

let startTime = null;

let timerInterval = null;


document.addEventListener('DOMContentLoaded', async function() {
    console.log('Quiz page loaded');

    
    await loadFoldersToSidebar();

    
    setupFolderModal();

    
    await initializeQuiz();

    
    setupEventListeners();

    
    startTimer();
});



function setupFolderModal() {

    const folderModal = document.getElementById('createFolderModal');

    const closeButton = document.getElementById('closeFolderModalButton');

    const cancelButton = document.getElementById('cancelFolderModalButton');

    const folderForm = document.getElementById('createFolderForm');

    if (closeButton) {
        closeButton.addEventListener('click', closeFolderModal);
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', closeFolderModal);
    }

    if (folderModal) {
        folderModal.addEventListener('click', function(e) {
            if (e.target === folderModal) {
                closeFolderModal();
            }
        });
    }

    if (folderForm) {
        folderForm.addEventListener('submit', handleCreateFolder);
    }
}


async function initializeQuiz() {
    
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id');

    if (!quizId) {
        showWarning('No quiz selected');
        window.location.href = '/pages/quizzes.html';
        return;
    }

    try {
        
        currentQuiz = await getQuizById(quizId);

        console.log('Quiz loaded:', currentQuiz);

        
        userAnswers = new Array(currentQuiz.questions.length).fill(null);

        
        document.getElementById('quizTitle').textContent = currentQuiz.title;

        // make the difficulty look nice with capital letter
        const difficultyText = currentQuiz.difficulty.charAt(0).toUpperCase() + currentQuiz.difficulty.slice(1);
        document.getElementById('quizMeta').textContent = `${currentQuiz.questions.length} Questions • ${difficultyText} Difficulty`;

        
        loadQuestion(0);

    } catch (error) {
        console.error('Error loading quiz:', error);
        showError('Failed to load quiz: ' + error.message);
        window.location.href = '/pages/quizzes.html';
    }
}

function loadQuestion(index) {
    currentQuestionIndex = index;
    const question = currentQuiz.questions[index];

    
    document.getElementById('questionNumber').textContent = `Question ${index + 1}`;
    document.getElementById('questionText').textContent = question.question;

    
    updateProgress();

    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, i) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option_item';
        optionElement.dataset.option = String.fromCharCode(65 + i);

        // check if this option was previously selected
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

    
    updateNavigationButtons();
}


function selectOption(optionIndex) {
    
    userAnswers[currentQuestionIndex] = optionIndex;

    
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
    const totalQuestions = currentQuiz.questions.length;
    const currentQuestion = currentQuestionIndex + 1;
    const progressPercentage = (currentQuestion / totalQuestions) * 100;

    document.getElementById('progressText').textContent = `Question ${currentQuestion} of ${totalQuestions}`;
    document.getElementById('progressBar').style.width = `${progressPercentage}%`;
}


function updateNavigationButtons() {
    const previousButton = document.getElementById('previousButton');
    const nextButton = document.getElementById('nextButton');

    
    if (currentQuestionIndex === 0) {
        previousButton.disabled = true;
    } else {
        previousButton.disabled = false;
    }

    
    if (currentQuestionIndex === currentQuiz.questions.length - 1) {
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
    
    document.getElementById('previousButton').addEventListener('click', function() {
        if (currentQuestionIndex > 0) {
            loadQuestion(currentQuestionIndex - 1);
        }
    });

    
    document.getElementById('nextButton').addEventListener('click', function() {
        if (currentQuestionIndex < currentQuiz.questions.length - 1) {
            loadQuestion(currentQuestionIndex + 1);
        } else {
            
            showSubmitConfirmation();
        }
    });

    
    document.getElementById('exitQuizButton').addEventListener('click', function() {
        showExitConfirmation();
    });


    
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
        
        saveProgress();
        window.location.href = 'quizzes.html';
    });

    exitConfirmModal.addEventListener('click', function(e) {
        if (e.target === exitConfirmModal) {
            exitConfirmModal.style.display = 'none';
        }
    });


    // submit confirmation modal handlers
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

    
    const createNewButton = document.querySelector('.create_new_button');
    if (createNewButton) {
        createNewButton.addEventListener('click', function() {
            window.location.href = '/pages/note_editor.html';
        });
    }
}


function showExitConfirmation() {
    document.getElementById('exitConfirmModal').style.display = 'flex';
}


function showSubmitConfirmation() {
    const answeredCount = userAnswers.filter(answer => answer !== null).length;
    const totalQuestions = currentQuiz.questions.length;

    const confirmText = `You have answered ${answeredCount} out of ${totalQuestions} questions. Are you sure you want to submit?`;
    document.getElementById('submitConfirmText').textContent = confirmText;

    document.getElementById('submitConfirmModal').style.display = 'flex';
}


function saveProgress() {
    // save quiz progress so user can come back later
    const progress = {
        quizId: currentQuiz.id,
        currentQuestion: currentQuestionIndex,
        answers: userAnswers,
        startTime: startTime,
        lastUpdated: Date.now()
    };

    localStorage.setItem('quiz_progress_' + currentQuiz.id, JSON.stringify(progress));
    console.log('Progress saved');
}


async function submitQuiz() {
    
    clearInterval(timerInterval);

    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
        
        const response = await submitQuizResult(currentQuiz.id, userAnswers, timeSpent);
        
        console.log('Quiz submitted successfully:', response);

        // build result object with all the data the results page needs
        const result = {
            quizId: currentQuiz.id,
            quizTitle: currentQuiz.title,
            score: response.score,
            correctAnswers: response.correctAnswers,
            totalQuestions: response.totalQuestions,
            timeSpent: timeSpent,
            answers: userAnswers,
            questions: currentQuiz.questions,
            completedAt: response.completedAt,
            dateTaken: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        };

        
        localStorage.setItem('current_quiz_result', JSON.stringify(result));

        
        localStorage.removeItem('quiz_progress_' + currentQuiz.id);

        
        window.location.href = `quiz_results.html?id=${currentQuiz.id}`;

    } catch (error) {
        console.error('Error submitting quiz:', error);
        showError('Failed to submit quiz: ' + error.message);
        
        
        document.getElementById('submitConfirmModal').style.display = 'none';
    }
}
