if (!requireAuth()) {
    // this makes sure user is logged in before showing the page
}



// I'm using this to generate quiz when user gives me a topic
async function generateQuizFromPrompt({ title, topic, questionCount, difficulty }) {
    try {
        const userToken = localStorage.getItem('auth_token');

        const serverResponse = await fetch(`${API_URL}/api/groq/generate-from-topic`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                topic,
                questionCount,
                difficulty
            })
        });

        if (!serverResponse.ok) {
            const errorData = await serverResponse.json();
            throw new Error(errorData.error || `API error: ${serverResponse.status}`);
        }

        const quizData = await serverResponse.json();

        quizData.id = 'quiz_' + Date.now();
        quizData.type = 'prompt';
        quizData.createdAt = new Date().toISOString();
        quizData.dateCreated = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        return quizData;

    } catch (error) {
        console.error('Error generating quiz:', error);
        throw error;
    }
}


// This one generates quizzes from actual notes or PDFs the user uploaded
async function generateQuizFromText({ title, textContent, questionCount, difficulty }) {
    try {
        const userToken = localStorage.getItem('auth_token');

        const serverResponse = await fetch(`${API_URL}/api/groq/generate-from-text`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                textContent,
                questionCount,
                difficulty
            })
        });

        if (!serverResponse.ok) {
            const errorData = await serverResponse.json();
            throw new Error(errorData.error || `API error: ${serverResponse.status}`);
        }

        const quizData = await serverResponse.json();

        quizData.id = 'quiz_' + Date.now();
        quizData.type = 'pdf';
        quizData.createdAt = new Date().toISOString();
        quizData.dateCreated = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        return quizData;

    } catch (error) {
        console.error('Error generating quiz from text:', error);
        throw error;
    }
}


async function extractTextFromPDF(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let extractedText = '';

        for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
            const currentPage = await pdfDocument.getPage(pageNumber);
            const textContent = await currentPage.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            extractedText += pageText + '\n\n';
        }

        return extractedText.trim();

    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to extract text from PDF: ' + error.message);
    }
}


async function getNoteContent(noteId) {
    try {
        const noteResponse = await getNoteById(noteId);

        // i need to strip out the HTML tags to get clean text for the AI
        const temporaryDiv = document.createElement('div');
        temporaryDiv.innerHTML = noteResponse.content || '';
        const cleanText = temporaryDiv.textContent || temporaryDiv.innerText || '';

        return cleanText || 'Content not found';

    } catch (error) {
        console.error('Error fetching note:', error);
        throw new Error('Failed to load note content');
    }
}


function showLoading(message = 'Generating quiz...') {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    loadingOverlay.innerHTML = `
        <div style="background: white; padding: 32px; border-radius: 12px; text-align: center;">
            <div style="font-size: 16px; color: #1D1D1F; margin-bottom: 16px;">${message}</div>
            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #018790; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(loadingOverlay);
}


function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}


// when the page loads i need to set everything up
document.addEventListener('DOMContentLoaded', async function() {

    await loadFoldersToSidebar();
    console.log('Quizzes page loaded');

    await loadQuizzesFromDatabase();

    await loadNotesToDropdown();


    // setting up the folder creation modal
    const folderModal = document.getElementById('createFolderModal');
    const addFolderButton = document.querySelector('.add_folder_button');
    const closeFolderModalButton = document.getElementById('closeFolderModalButton');
    const cancelFolderModalButton = document.getElementById('cancelFolderModalButton');
    const createFolderForm = document.getElementById('createFolderForm');

    if (addFolderButton) {
        addFolderButton.addEventListener('click', function() {
            folderModal.style.display = 'flex';
        });
    }

    if (closeFolderModalButton) {
        closeFolderModalButton.addEventListener('click', function() {
            folderModal.style.display = 'none';
        });
    }

    if (cancelFolderModalButton) {
        cancelFolderModalButton.addEventListener('click', function() {
            folderModal.style.display = 'none';
        });
    }

    if (folderModal) {
        folderModal.addEventListener('click', function(e) {
            if (e.target === folderModal) {
                folderModal.style.display = 'none';
            }
        });
    }

    if (createFolderForm) {
        createFolderForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const folderName = document.getElementById('folderName').value;
            const selectedColor = document.querySelector('input[name="folderColor"]:checked').value;

            try {
                await createFolder({ name: folderName, color: selectedColor });
                folderModal.style.display = 'none';
                createFolderForm.reset();
                await loadFoldersToSidebar();

            } catch (error) {
                console.error('Error creating folder:', error);
                showError('Failed to create folder. Please try again.');
            }
        });
    }


    // now i'm setting up the quiz generation modal
    const generateQuizModal = document.getElementById('generateQuizModal');
    const generateQuizButton = document.getElementById('generateQuizButton');
    const closeGenerateModalButton = document.getElementById('closeGenerateModalButton');
    const promptQuizOption = document.getElementById('promptQuizOption');
    const pdfQuizOption = document.getElementById('pdfQuizOption');

    if (generateQuizButton) {
        generateQuizButton.addEventListener('click', function() {
            generateQuizModal.style.display = 'flex';
        });
    }

    if (closeGenerateModalButton) {
        closeGenerateModalButton.addEventListener('click', function() {
            generateQuizModal.style.display = 'none';
        });
    }

    if (generateQuizModal) {
        generateQuizModal.addEventListener('click', function(e) {
            if (e.target === generateQuizModal) {
                generateQuizModal.style.display = 'none';
            }
        });
    }


    // handling the prompt-based quiz modal
    const promptQuizModal = document.getElementById('promptQuizModal');
    const closePromptModalButton = document.getElementById('closePromptModalButton');
    const cancelPromptModalButton = document.getElementById('cancelPromptModalButton');
    const promptQuizForm = document.getElementById('promptQuizForm');

    // Open prompt quiz modal when option is clicked
    if (promptQuizOption) {
        promptQuizOption.addEventListener('click', function() {
            generateQuizModal.style.display = 'none';
            promptQuizModal.style.display = 'flex';
        });
    }

    // Close prompt quiz modal
    if (closePromptModalButton) {
        closePromptModalButton.addEventListener('click', function() {
            promptQuizModal.style.display = 'none';
        });
    }

    if (cancelPromptModalButton) {
        cancelPromptModalButton.addEventListener('click', function() {
            promptQuizModal.style.display = 'none';
        });
    }

    if (promptQuizModal) {
        promptQuizModal.addEventListener('click', function(e) {
            if (e.target === promptQuizModal) {
                promptQuizModal.style.display = 'none';
            }
        });
    }

    if (promptQuizForm) {
        promptQuizForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const quizData = {
                title: document.getElementById('promptQuizTitle').value,
                topic: document.getElementById('promptQuizTopic').value,
                questionCount: parseInt(document.getElementById('promptQuizCount').value),
                difficulty: document.getElementById('promptQuizDifficulty').value
            };

            console.log('Generating quiz from prompt:', quizData);

            promptQuizModal.style.display = 'none';
            showLoading('Generating quiz with AI...');

            try {
                const generatedQuiz = await generateQuizFromPrompt(quizData);

                console.log('Quiz generated successfully:', generatedQuiz);

                // now i need to save it to the database
                const savedQuiz = await createQuiz({
                    title: generatedQuiz.title,
                    difficulty: generatedQuiz.difficulty,
                    type: 'prompt',
                    questions: generatedQuiz.questions.map(q => ({
                        question: q.question,
                        options: q.options,
                        correctAnswer: q.correctAnswer
                    }))
                });

                hideLoading();

                showSuccess('Quiz generated successfully! Redirecting to quiz...');
                window.location.href = `take_quiz.html?id=${savedQuiz.quiz.id}`;

            } catch (error) {
                hideLoading();
                console.error('Error generating quiz:', error);

                let errorMessage = 'Failed to generate quiz. ';
                if (error.message.includes('API key')) {
                    errorMessage += 'Please add your Groq API key in quizzes.js';
                } else if (error.message.includes('quota')) {
                    errorMessage += 'API quota exceeded. Please try again later.';
                } else {
                    errorMessage += error.message;
                }

                showError(errorMessage);
                promptQuizModal.style.display = 'flex';
            }

            promptQuizForm.reset();
        });
    }


    // handling the PDF/note quiz modal
    const pdfQuizModal = document.getElementById('pdfQuizModal');
    const closePdfModalButton = document.getElementById('closePdfModalButton');
    const cancelPdfModalButton = document.getElementById('cancelPdfModalButton');
    const pdfQuizForm = document.getElementById('pdfQuizForm');
    const pdfFileInput = document.getElementById('pdfFileInput');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileSelected = document.getElementById('fileSelected');
    const fileName = document.getElementById('fileName');
    const removeFileButton = document.getElementById('removeFileButton');
    const cloudinaryTab = document.getElementById('cloudinaryTab');
    const uploadTab = document.getElementById('uploadTab');
    const cloudinarySection = document.getElementById('cloudinarySection');
    const uploadSection = document.getElementById('uploadSection');

    if (pdfQuizOption) {
        pdfQuizOption.addEventListener('click', function() {
            generateQuizModal.style.display = 'none';
            pdfQuizModal.style.display = 'flex';
        });
    }

    // user can choose between their saved notes or uploading a new PDF
    if (cloudinaryTab && uploadTab) {
        const cloudinaryPdfSelect = document.getElementById('cloudinaryPdfSelect');
        const pdfFileInputForTab = document.getElementById('pdfFileInput');

        cloudinaryTab.addEventListener('click', function() {
            cloudinaryTab.classList.add('active');
            uploadTab.classList.remove('active');
            cloudinarySection.style.display = 'block';
            uploadSection.style.display = 'none';
            if (cloudinaryPdfSelect) cloudinaryPdfSelect.required = true;
            if (pdfFileInputForTab) pdfFileInputForTab.required = false;
        });

        uploadTab.addEventListener('click', function() {
            uploadTab.classList.add('active');
            cloudinaryTab.classList.remove('active');
            uploadSection.style.display = 'block';
            cloudinarySection.style.display = 'none';
            if (cloudinaryPdfSelect) cloudinaryPdfSelect.required = false;
            if (pdfFileInputForTab) pdfFileInputForTab.required = true;
        });
    }

    
    if (closePdfModalButton) {
        closePdfModalButton.addEventListener('click', function() {
            pdfQuizModal.style.display = 'none';
        });
    }

    if (cancelPdfModalButton) {
        cancelPdfModalButton.addEventListener('click', function() {
            pdfQuizModal.style.display = 'none';
        });
    }

    if (pdfQuizModal) {
        pdfQuizModal.addEventListener('click', function(e) {
            if (e.target === pdfQuizModal) {
                pdfQuizModal.style.display = 'none';
            }
        });
    }

    if (pdfFileInput) {
        pdfFileInput.addEventListener('change', function(e) {
            const uploadedFile = e.target.files[0];
            if (uploadedFile) {
                if (uploadedFile.type !== 'application/pdf') {
                    showWarning('Please upload a PDF file');
                    pdfFileInput.value = '';
                    return;
                }

                if (uploadedFile.size > 10 * 1024 * 1024) {
                    showWarning('File size must be less than 10MB');
                    pdfFileInput.value = '';
                    return;
                }

                fileName.textContent = uploadedFile.name;
                fileUploadArea.querySelector('.upload_placeholder').style.display = 'none';
                fileSelected.style.display = 'flex';
            }
        });
    }

    if (removeFileButton) {
        removeFileButton.addEventListener('click', function(e) {
            e.stopPropagation();
            pdfFileInput.value = '';
            fileUploadArea.querySelector('.upload_placeholder').style.display = 'block';
            fileSelected.style.display = 'none';
        });
    }

    if (pdfQuizForm) {
        pdfQuizForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const isCloudinaryActive = cloudinaryTab.classList.contains('active');

            const quizTitle = document.getElementById('pdfQuizTitle').value;
            const numberOfQuestions = parseInt(document.getElementById('pdfQuizCount').value);
            const quizDifficulty = document.getElementById('pdfQuizDifficulty').value;

            let quizData;

            if (isCloudinaryActive) {
                const selectedNote = document.getElementById('cloudinaryPdfSelect').value;
                if (!selectedNote) {
                    showWarning('Please select a PDF from your materials');
                    return;
                }

                quizData = {
                    type: 'pdf',
                    source: 'cloudinary',
                    title: quizTitle,
                    pdfId: selectedNote,
                    questionCount: numberOfQuestions,
                    difficulty: quizDifficulty
                };
            } else {
                const fileInput = document.getElementById('pdfFileInput');
                const uploadedFile = fileInput ? fileInput.files[0] : null;

                if (!uploadedFile) {
                    showWarning('Please upload a PDF file');
                    return;
                }

                quizData = {
                    type: 'pdf',
                    source: 'upload',
                    title: quizTitle,
                    file: uploadedFile,
                    questionCount: numberOfQuestions,
                    difficulty: quizDifficulty
                };
            }

            console.log('Generating quiz from PDF/Note:', quizData);

            pdfQuizModal.style.display = 'none';
            showLoading('Processing content and generating quiz with AI...');

            try {
                let extractedContent;

                if (isCloudinaryActive) {
                    const selectedNoteId = document.getElementById('cloudinaryPdfSelect').value;

                    console.log('Getting content for note ID:', selectedNoteId);
                    extractedContent = await getNoteContent(selectedNoteId);
                    console.log('Got note content, length:', extractedContent.length);
                } else {
                    const fileInput = document.getElementById('pdfFileInput');
                    const uploadedFile = fileInput.files[0];

                    if (!uploadedFile) {
                        hideLoading();
                        showWarning('No file selected. Please try again.');
                        pdfQuizModal.style.display = 'flex';
                        return;
                    }

                    console.log('Extracting text from PDF:', uploadedFile.name);
                    extractedContent = await extractTextFromPDF(uploadedFile);
                    console.log('Extracted text length:', extractedContent.length);
                }

                // now i send this text to the AI to generate quiz questions
                const generatedQuiz = await generateQuizFromText({
                    title: quizTitle,
                    textContent: extractedContent,
                    questionCount: numberOfQuestions,
                    difficulty: quizDifficulty
                });

                console.log('Quiz generated successfully:', generatedQuiz);

                const savedQuiz = await createQuiz({
                    title: generatedQuiz.title,
                    difficulty: generatedQuiz.difficulty,
                    type: 'pdf',
                    questions: generatedQuiz.questions.map(q => ({
                        question: q.question,
                        options: q.options,
                        correctAnswer: q.correctAnswer
                    }))
                });

                hideLoading();

                showSuccess('Quiz generated successfully! Redirecting to quiz...');
                window.location.href = `take_quiz.html?id=${savedQuiz.quiz.id}`;

            } catch (error) {
                hideLoading();
                console.error('Error generating PDF/Note quiz:', error);
                showError('Failed to generate quiz: ' + error.message);
            }

            // Reset form
            pdfQuizForm.reset();
            
            // Reset file upload area using fresh references
            const fileInputToReset = document.getElementById('pdfFileInput');
            const uploadAreaToReset = document.getElementById('fileUploadArea');
            const fileSelectedToReset = document.getElementById('fileSelected');
            
            if (fileInputToReset) fileInputToReset.value = '';
            if (uploadAreaToReset) {
                const placeholder = uploadAreaToReset.querySelector('.upload_placeholder');
                if (placeholder) placeholder.style.display = 'block';
            }
            if (fileSelectedToReset) fileSelectedToReset.style.display = 'none';

            // Reset to cloudinary tab
            const cloudinaryTabReset = document.getElementById('cloudinaryTab');
            const uploadTabReset = document.getElementById('uploadTab');
            const cloudinarySectionReset = document.getElementById('cloudinarySection');
            const uploadSectionReset = document.getElementById('uploadSection');
            
            if (cloudinaryTabReset) cloudinaryTabReset.classList.add('active');
            if (uploadTabReset) uploadTabReset.classList.remove('active');
            if (cloudinarySectionReset) cloudinarySectionReset.style.display = 'block';
            if (uploadSectionReset) uploadSectionReset.style.display = 'none';
        });
    }


    // search and filter functionality
    const searchInput = document.getElementById('searchQuizzes');
    const filterSelect = document.getElementById('filterQuizzes');

    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            filterQuizzesBySearch(searchTerm);
        });
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', function(e) {
            const filterValue = e.target.value;
            filterQuizzesByStatus(filterValue);
        });
    }

});


function filterQuizzesBySearch(searchTerm) {
    const allQuizRows = document.querySelectorAll('.table_row');

    allQuizRows.forEach(row => {
        const quizNameElement = row.querySelector('.quiz_name');
        if (quizNameElement) {
            const quizName = quizNameElement.textContent.toLowerCase();
            if (quizName.includes(searchTerm)) {
                row.style.display = 'grid';
            } else {
                row.style.display = 'none';
            }
        }
    });
}


function filterQuizzesByStatus(statusFilter) {
    const allQuizRows = document.querySelectorAll('.table_row');

    allQuizRows.forEach(row => {
        const scoreElement = row.querySelector('.quiz_score');
        if (!scoreElement) return;

        const isCompleted = scoreElement.classList.contains('completed_score');
        const isNotStarted = scoreElement.classList.contains('not_started');

        if (statusFilter === 'all') {
            row.style.display = 'grid';
        } else if (statusFilter === 'completed' && isCompleted) {
            row.style.display = 'grid';
        } else if (statusFilter === 'not_started' && isNotStarted) {
            row.style.display = 'grid';
        } else {
            row.style.display = 'none';
        }
    });
}


async function loadQuizzesFromDatabase() {
    try {
        console.log('Loading quizzes from database...');

        const serverResponse = await getUserQuizzes();
        const userQuizzes = serverResponse.quizzes || [];

        console.log(`Found ${userQuizzes.length} quizzes`);

        await updateQuizStats(userQuizzes);

        const quizTableBody = document.getElementById('quizzesTableBody');

        if (!quizTableBody) {
            console.log('Quiz table body not found');
            return;
        }

        quizTableBody.innerHTML = '';

        if (userQuizzes.length === 0) {
            quizTableBody.innerHTML = `
                <div class="empty_state">
                    <p class="empty_title">No quizzes yet</p>
                    <p class="empty_subtitle">Click "+ Generate Quiz" to create your first quiz!</p>
                </div>
            `;
            return;
        }

        // I'm creating a row for each quiz to display in the table
        for (const quiz of userQuizzes) {
            const quizRow = await createQuizRow(quiz);
            quizTableBody.appendChild(quizRow);
        }

        console.log('Quizzes loaded successfully');

    } catch (error) {
        console.error('Error loading quizzes:', error);

        const quizTableBody = document.getElementById('quizzesTableBody');
        if (quizTableBody) {
            quizTableBody.innerHTML = `
                <div class="error_state">
                    <p>Failed to load quizzes. Please refresh the page.</p>
                </div>
            `;
        }
    }
}


async function updateQuizStats(quizzes) {
    try {
        const totalQuizCount = quizzes.length;
        document.getElementById('totalQuizzes').textContent = totalQuizCount;

        let completedQuizCount = 0;
        let combinedScore = 0;

        // I need to check each quiz to see if it has been taken
        for (const quiz of quizzes) {
            try {
                const resultsResponse = await getQuizResults(quiz.id);
                const quizResults = resultsResponse.results || [];

                if (quizResults.length > 0) {
                    completedQuizCount++;

                    const mostRecentResult = quizResults[0];
                    combinedScore += mostRecentResult.score;
                }
            } catch (err) {
                // this quiz hasn't been taken yet
            }
        }

        document.getElementById('quizzesTaken').textContent = completedQuizCount;

        if (completedQuizCount > 0) {
            const averagePercentage = Math.round(combinedScore / completedQuizCount);
            document.getElementById('averageScore').textContent = averagePercentage + '%';
        } else {
            document.getElementById('averageScore').textContent = '0%';
        }

    } catch (error) {
        console.error('Error updating quiz stats:', error);
    }
}


async function createQuizRow(quiz) {
    const quizRow = document.createElement('div');
    quizRow.className = 'table_row';
    quizRow.dataset.quizId = quiz.id;

    const quizCreationDate = new Date(quiz.createdAt);
    let displayDate = 'Recently';
    if (quizCreationDate && !isNaN(quizCreationDate.getTime())) {
        displayDate = quizCreationDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    const badgeClass = quiz.type === 'pdf' ? 'pdf_badge' : 'prompt_badge';
    const badgeText = quiz.type === 'pdf' ? 'PDF' : 'Prompt';

    let scoreDisplay = '';
    let actionButtons = '';
    let quizWasTaken = false;
    let mostRecentScore = 0;

    try {
        const resultsResponse = await getQuizResults(quiz.id);
        const quizResultsList = resultsResponse.results || [];

        if (quizResultsList.length > 0) {
            quizWasTaken = true;
            mostRecentScore = quizResultsList[0].score;
            scoreDisplay = `<span class="quiz_score completed_score">${mostRecentScore}%</span>`;
            actionButtons = `
                <button class="action_button retake_button" data-quiz-id="${quiz.id}">Retake</button>
                <button class="action_button view_button" data-quiz-id="${quiz.id}">View Results</button>
            `;
        } else {
            scoreDisplay = `<span class="quiz_score not_started">Not Started</span>`;
            actionButtons = `<button class="action_button start_button" data-quiz-id="${quiz.id}">Start Quiz</button>`;
        }
    } catch (err) {
        scoreDisplay = `<span class="quiz_score not_started">Not Started</span>`;
        actionButtons = `<button class="action_button start_button" data-quiz-id="${quiz.id}">Start Quiz</button>`;
    }

    quizRow.innerHTML = `
        <div class="table_cell quiz_name_cell">
            <span class="quiz_name">${quiz.title}</span>
        </div>
        <div class="table_cell quiz_type_cell">
            <span class="type_badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="table_cell quiz_questions_cell">
            <span class="quiz_questions">${quiz.questionCount}</span>
        </div>
        <div class="table_cell quiz_score_cell">
            ${scoreDisplay}
        </div>
        <div class="table_cell quiz_date_cell">
            <span class="quiz_date">${displayDate}</span>
        </div>
        <div class="table_cell quiz_actions_cell">
            ${actionButtons}
        </div>
    `;

    const startButton = quizRow.querySelector('.start_button');
    const retakeButton = quizRow.querySelector('.retake_button');
    const viewButton = quizRow.querySelector('.view_button');

    if (startButton) {
        startButton.addEventListener('click', function(e) {
            e.stopPropagation();
            window.location.href = `take_quiz.html?id=${quiz.id}`;
        });
    }

    if (retakeButton) {
        retakeButton.addEventListener('click', function(e) {
            e.stopPropagation();
            window.location.href = `take_quiz.html?id=${quiz.id}`;
        });
    }

    if (viewButton) {
        viewButton.addEventListener('click', function(e) {
            e.stopPropagation();
            window.location.href = `quiz_results.html?id=${quiz.id}`;
        });
    }

    return quizRow;
}


async function loadNotesToDropdown() {
    try {
        const notesResponse = await getUserNotes();
        const userNotes = notesResponse.notes || [];

        const notesDropdown = document.getElementById('cloudinaryPdfSelect');
        if (!notesDropdown) return;

        notesDropdown.innerHTML = '<option value="">Choose a note...</option>';

        if (userNotes.length === 0) {
            notesDropdown.innerHTML = '<option value="">No notes found - create some first!</option>';
            return;
        }

        userNotes.forEach(note => {
            const noteOption = document.createElement('option');
            noteOption.value = note.id;
            noteOption.textContent = note.title || 'Untitled Note';
            notesDropdown.appendChild(noteOption);
        });

        console.log(`Loaded ${userNotes.length} notes into dropdown`);

    } catch (error) {
        console.error('Error loading notes for dropdown:', error);
    }
}
