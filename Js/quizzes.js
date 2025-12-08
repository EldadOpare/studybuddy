// Groq AI Configuration
const GROQ_API_KEY = 'MY_GROQ_API_KEY';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Logout function
function logout() {
    // Redirect to login page
    window.location.href = 'login.html';
}

// Generate quiz using Groq AI API
async function generateQuizFromPrompt({ title, topic, questionCount, difficulty }) {
    const systemPrompt = `You are a quiz generation expert. Generate educational multiple-choice quizzes based on the given topic.

Your response MUST be a valid JSON object with this exact structure:
{
  "title": "Quiz Title",
  "difficulty": "easy|medium|hard",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

Rules:
- Each question must have exactly 4 options
- correctAnswer is the index (0-3) of the correct option
- Questions should be clear and unambiguous
- Options should be plausible but only one should be correct
- Return ONLY the JSON object, no additional text`;

    const userPrompt = `Generate a ${difficulty} difficulty quiz about: ${topic}

Requirements:
- Generate exactly ${questionCount} questions
- Title: "${title}"
- Difficulty: ${difficulty}
- Make questions educational and accurate`;

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 4096,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        const quizData = JSON.parse(data.choices[0].message.content);

        // Add metadata
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

// Generate quiz from text content (for notes and PDFs)
async function generateQuizFromText({ title, textContent, questionCount, difficulty }) {
    const systemPrompt = `You are a quiz generation expert. Generate educational multiple-choice quizzes based on the provided content.

Your response MUST be a valid JSON object with this exact structure:
{
  "title": "Quiz Title",
  "difficulty": "easy|medium|hard",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

Rules:
- Each question must have exactly 4 options
- correctAnswer is the index (0-3) of the correct option
- Questions MUST be based on the provided content
- Options should be plausible but only one should be correct
- Return ONLY the JSON object, no additional text`;

    const userPrompt = `Based on the following content, generate a ${difficulty} difficulty quiz:

CONTENT:
${textContent.substring(0, 8000)}

Requirements:
- Generate exactly ${questionCount} questions
- Title: "${title}"
- Difficulty: ${difficulty}
- Questions must be based on the content above
- Make questions test understanding of the material`;

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 4096,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        const quizData = JSON.parse(data.choices[0].message.content);

        // Add metadata
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

// Extract text from PDF file using PDF.js
async function extractTextFromPDF(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        // Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n\n';
        }

        return fullText.trim();
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to extract text from PDF: ' + error.message);
    }
}

// Mock function to get note content (replace with actual implementation)
function getNoteContent(noteId) {
    // This is mock data - in production, fetch from your database/API
    const mockNotes = {
        'note1': `Cell Structure - Biology 101

The cell is the basic unit of life. All living organisms are made up of one or more cells.

Major Cell Organelles:

1. Nucleus - Contains genetic material (DNA) and controls cell activities
2. Mitochondria - Powerhouse of the cell, produces ATP through cellular respiration
3. Ribosomes - Sites of protein synthesis
4. Endoplasmic Reticulum (ER) - Network of membranes for protein and lipid synthesis
5. Golgi Apparatus - Packages and distributes proteins
6. Lysosomes - Contains enzymes for breaking down waste
7. Cell Membrane - Controls what enters and leaves the cell
8. Cytoplasm - Jelly-like substance filling the cell

Plant Cell Specific Organelles:
- Chloroplasts - Site of photosynthesis
- Cell Wall - Rigid outer structure for protection and support
- Large Central Vacuole - Stores water and nutrients

The cell membrane is selectively permeable, controlling the movement of substances in and out of the cell through various processes including diffusion, osmosis, and active transport.`,

        'note2': `World War II Summary - History Notes

World War II (1939-1945) was a global conflict involving most of the world's nations.

Major Events:
- 1939: Germany invades Poland, beginning WWII
- 1940: Battle of Britain
- 1941: Germany invades Soviet Union; Pearl Harbor attack
- 1942: Battle of Midway; Battle of Stalingrad begins
- 1944: D-Day invasion of Normandy
- 1945: Germany surrenders; Atomic bombs dropped on Japan; Japan surrenders

Key Players:
Allied Powers: USA, UK, Soviet Union, France, China
Axis Powers: Germany, Italy, Japan

The war resulted in approximately 70-85 million deaths and led to the creation of the United Nations.`,

        'note3': `Python Functions - Programming Guide

Functions in Python are reusable blocks of code that perform specific tasks.

Defining a Function:
def function_name(parameters):
    # code block
    return result

Parameters and Arguments:
- Parameters are variables in function definition
- Arguments are values passed when calling function

Types of Functions:
1. Built-in functions (print, len, type)
2. User-defined functions
3. Lambda functions (anonymous functions)

Return Statement:
Functions can return values using the return keyword.

Example:
def add_numbers(a, b):
    return a + b

result = add_numbers(5, 3)  # returns 8`,

        'note4': `Chemistry - Periodic Table

The periodic table organizes elements by atomic number and chemical properties.

Key Concepts:
- Atomic Number: Number of protons in nucleus
- Atomic Mass: Average mass of atom
- Groups: Vertical columns with similar properties
- Periods: Horizontal rows

Element Groups:
1. Alkali Metals (Group 1)
2. Alkaline Earth Metals (Group 2)
3. Transition Metals (Groups 3-12)
4. Halogens (Group 17)
5. Noble Gases (Group 18)

Elements are arranged in order of increasing atomic number.`
    };

    return mockNotes[noteId] || 'Content not found';
}

// Show loading state
function showLoading(message = 'Generating quiz...') {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingOverlay';
    loadingDiv.style.cssText = `
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
    loadingDiv.innerHTML = `
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
    document.body.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.getElementById('loadingOverlay');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}


// Run when page loads
document.addEventListener('DOMContentLoaded', function() {

    console.log('Quizzes page loaded');


    // ===== FOLDER MODAL =====
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
        createFolderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const folderName = document.getElementById('folderName').value;
            const selectedColor = document.querySelector('input[name="folderColor"]:checked').value;
            console.log('Creating folder:', folderName, 'with color:', selectedColor);
            folderModal.style.display = 'none';
            createFolderForm.reset();
        });
    }


    // ===== GENERATE QUIZ MODAL =====
    const generateQuizModal = document.getElementById('generateQuizModal');
    const generateQuizButton = document.getElementById('generateQuizButton');
    const closeGenerateModalButton = document.getElementById('closeGenerateModalButton');
    const promptQuizOption = document.getElementById('promptQuizOption');
    const pdfQuizOption = document.getElementById('pdfQuizOption');

    // Open generate quiz modal
    if (generateQuizButton) {
        generateQuizButton.addEventListener('click', function() {
            generateQuizModal.style.display = 'flex';
        });
    }

    // Close generate quiz modal
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


    // ===== PROMPT QUIZ MODAL =====
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

    // Handle prompt quiz form submission
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

            // Show loading state
            promptQuizModal.style.display = 'none';
            showLoading('Generating quiz with AI...');

            try {
                // Generate quiz using Groq AI
                const generatedQuiz = await generateQuizFromPrompt(quizData);

                console.log('Quiz generated successfully:', generatedQuiz);

                // Save quiz to localStorage
                const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
                existingQuizzes.push(generatedQuiz);
                localStorage.setItem('quizzes', JSON.stringify(existingQuizzes));

                // Store current quiz for taking
                localStorage.setItem('current_quiz', JSON.stringify(generatedQuiz));

                hideLoading();

                // Show success message and redirect
                alert('Quiz generated successfully! Redirecting to quiz...');
                window.location.href = 'take_quiz.html';

            } catch (error) {
                hideLoading();
                console.error('Error generating quiz:', error);

                // Show user-friendly error message
                let errorMessage = 'Failed to generate quiz. ';
                if (error.message.includes('API key')) {
                    errorMessage += 'Please add your Groq API key in quizzes.js';
                } else if (error.message.includes('quota')) {
                    errorMessage += 'API quota exceeded. Please try again later.';
                } else {
                    errorMessage += error.message;
                }

                alert(errorMessage);
                promptQuizModal.style.display = 'flex';
            }

            promptQuizForm.reset();
        });
    }


    // ===== PDF QUIZ MODAL =====
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

    // Open PDF quiz modal when option is clicked
    if (pdfQuizOption) {
        pdfQuizOption.addEventListener('click', function() {
            generateQuizModal.style.display = 'none';
            pdfQuizModal.style.display = 'flex';
        });
    }

    // Handle PDF source tab switching
    if (cloudinaryTab && uploadTab) {
        cloudinaryTab.addEventListener('click', function() {
            cloudinaryTab.classList.add('active');
            uploadTab.classList.remove('active');
            cloudinarySection.style.display = 'block';
            uploadSection.style.display = 'none';
        });

        uploadTab.addEventListener('click', function() {
            uploadTab.classList.add('active');
            cloudinaryTab.classList.remove('active');
            uploadSection.style.display = 'block';
            cloudinarySection.style.display = 'none';
        });
    }

    // Close PDF quiz modal
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

    // Handle file selection
    if (pdfFileInput) {
        pdfFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.type !== 'application/pdf') {
                    alert('Please upload a PDF file');
                    pdfFileInput.value = '';
                    return;
                }

                if (file.size > 10 * 1024 * 1024) { // 10MB
                    alert('File size must be less than 10MB');
                    pdfFileInput.value = '';
                    return;
                }

                fileName.textContent = file.name;
                fileUploadArea.querySelector('.upload_placeholder').style.display = 'none';
                fileSelected.style.display = 'flex';
            }
        });
    }

    // Remove selected file
    if (removeFileButton) {
        removeFileButton.addEventListener('click', function(e) {
            e.stopPropagation();
            pdfFileInput.value = '';
            fileUploadArea.querySelector('.upload_placeholder').style.display = 'block';
            fileSelected.style.display = 'none';
        });
    }

    // Handle PDF quiz form submission
    if (pdfQuizForm) {
        pdfQuizForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Check which source is active
            const isCloudinaryActive = cloudinaryTab.classList.contains('active');

            const title = document.getElementById('pdfQuizTitle').value;
            const questionCount = parseInt(document.getElementById('pdfQuizCount').value);
            const difficulty = document.getElementById('pdfQuizDifficulty').value;

            let quizData;

            if (isCloudinaryActive) {
                const selectedPdf = document.getElementById('cloudinaryPdfSelect').value;
                if (!selectedPdf) {
                    alert('Please select a PDF from your materials');
                    return;
                }

                quizData = {
                    type: 'pdf',
                    source: 'cloudinary',
                    title: title,
                    pdfId: selectedPdf,
                    questionCount: questionCount,
                    difficulty: difficulty
                };
            } else {
                const file = pdfFileInput.files[0];
                if (!file) {
                    alert('Please upload a PDF file');
                    return;
                }

                quizData = {
                    type: 'pdf',
                    source: 'upload',
                    title: title,
                    file: file,
                    questionCount: questionCount,
                    difficulty: difficulty
                };
            }

            console.log('Generating quiz from PDF/Note:', quizData);

            // Close modal and show loading
            pdfQuizModal.style.display = 'none';
            showLoading('Processing content and generating quiz with AI...');

            try {
                let textContent;

                if (isCloudinaryActive) {
                    // Check if it's a note or PDF
                    const selectedId = document.getElementById('cloudinaryPdfSelect').value;

                    if (selectedId.startsWith('note')) {
                        // Get note content (already in text format)
                        textContent = getNoteContent(selectedId);
                        console.log('Using note content:', selectedId);
                    } else {
                        // For now, show message for PDF from Cloudinary
                        hideLoading();
                        alert('PDF quiz generation from Cloudinary requires backend integration.\n\nFor now, please:\n1. Use notes (already working!)\n2. Upload a new PDF file\n3. Or use prompt-based quiz generation');

                        // Reset form
                        pdfQuizForm.reset();
                        return;
                    }
                } else {
                    // Extract text from uploaded PDF file
                    const file = pdfFileInput.files[0];
                    console.log('Extracting text from PDF:', file.name);
                    textContent = await extractTextFromPDF(file);
                    console.log('Extracted text length:', textContent.length);
                }

                // Generate quiz from the text content
                const generatedQuiz = await generateQuizFromText({
                    title: title,
                    textContent: textContent,
                    questionCount: questionCount,
                    difficulty: difficulty
                });

                console.log('Quiz generated successfully:', generatedQuiz);

                // Save quiz to localStorage
                const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
                existingQuizzes.push(generatedQuiz);
                localStorage.setItem('quizzes', JSON.stringify(existingQuizzes));

                // Store current quiz for taking
                localStorage.setItem('current_quiz', JSON.stringify(generatedQuiz));

                hideLoading();

                // Show success message and redirect
                alert('Quiz generated successfully! Redirecting to quiz...');
                window.location.href = 'take_quiz.html';

            } catch (error) {
                hideLoading();
                console.error('Error generating PDF/Note quiz:', error);
                alert('Failed to generate quiz: ' + error.message);
            }

            // Reset form
            pdfQuizForm.reset();
            pdfFileInput.value = '';
            fileUploadArea.querySelector('.upload_placeholder').style.display = 'block';
            fileSelected.style.display = 'none';

            // Reset to cloudinary tab
            cloudinaryTab.classList.add('active');
            uploadTab.classList.remove('active');
            cloudinarySection.style.display = 'block';
            uploadSection.style.display = 'none';
        });
    }


    // ===== SEARCH & FILTER =====
    const searchInput = document.getElementById('searchQuizzes');
    const filterSelect = document.getElementById('filterQuizzes');

    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            console.log('Searching for:', searchTerm);
            // TODO: Filter quiz cards based on search term
        });
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', function(e) {
            const filter = e.target.value;
            console.log('Filtering by:', filter);
            // TODO: Filter quiz cards based on status
        });
    }


    // ===== QUIZ ACTION BUTTONS =====
    // Handle Start Quiz, Retake, and View Results buttons

    // Get all action buttons
    const startButtons = document.querySelectorAll('.start_button');
    const retakeButtons = document.querySelectorAll('.retake_button');
    const viewButtons = document.querySelectorAll('.view_button');

    // Start Quiz button - redirect to take quiz page
    startButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const row = e.target.closest('.table_row');
            const quizName = row.querySelector('.quiz_name').textContent;

            console.log('Starting quiz:', quizName);

            // For demo purposes, use the sample quiz
            // In production, load the actual quiz data based on quiz name/ID
            window.location.href = 'take_quiz.html';
        });
    });

    // Retake Quiz button - redirect to take quiz page
    retakeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const row = e.target.closest('.table_row');
            const quizName = row.querySelector('.quiz_name').textContent;

            console.log('Retaking quiz:', quizName);

            // Clear any previous results for this quiz
            // In production, load the quiz data and start fresh
            window.location.href = 'take_quiz.html';
        });
    });

    // View Results button - redirect to results page
    viewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const row = e.target.closest('.table_row');
            const quizName = row.querySelector('.quiz_name').textContent;
            const score = row.querySelector('.quiz_score').textContent;

            console.log('Viewing results for:', quizName, 'Score:', score);

            // In production, load the actual quiz results from localStorage/database
            // For demo, create mock results
            const mockResult = {
                quizId: 'quiz_demo',
                quizTitle: quizName,
                score: parseInt(score),
                correctAnswers: Math.floor((parseInt(score) / 100) * 10),
                totalQuestions: 10,
                timeSpent: 342,
                answers: [1, 2, 0, 1, 2, 0, 1, 2, 3, 1],
                questions: [
                    {
                        id: 1,
                        question: "What is the powerhouse of the cell?",
                        options: ["Nucleus", "Mitochondria", "Ribosome", "Endoplasmic Reticulum"],
                        correctAnswer: 1
                    },
                    {
                        id: 2,
                        question: "Which organelle is responsible for protein synthesis?",
                        options: ["Golgi Apparatus", "Lysosome", "Ribosome", "Vacuole"],
                        correctAnswer: 2
                    },
                    {
                        id: 3,
                        question: "What contains the genetic material of the cell?",
                        options: ["Nucleus", "Cytoplasm", "Cell Membrane", "Mitochondria"],
                        correctAnswer: 0
                    },
                    {
                        id: 4,
                        question: "Which structure controls what enters and leaves the cell?",
                        options: ["Cell Wall", "Cell Membrane", "Nucleus", "Cytoplasm"],
                        correctAnswer: 1
                    },
                    {
                        id: 5,
                        question: "What is the jelly-like substance inside the cell?",
                        options: ["Nucleus", "Vacuole", "Cytoplasm", "Chloroplast"],
                        correctAnswer: 2
                    },
                    {
                        id: 6,
                        question: "Which organelle is found only in plant cells?",
                        options: ["Mitochondria", "Chloroplast", "Ribosome", "Nucleus"],
                        correctAnswer: 1
                    },
                    {
                        id: 7,
                        question: "What packages and distributes proteins in the cell?",
                        options: ["Golgi Apparatus", "Endoplasmic Reticulum", "Lysosome", "Peroxisome"],
                        correctAnswer: 0
                    },
                    {
                        id: 8,
                        question: "Which organelle breaks down waste materials?",
                        options: ["Ribosome", "Vacuole", "Lysosome", "Chloroplast"],
                        correctAnswer: 2
                    },
                    {
                        id: 9,
                        question: "What is the site of photosynthesis in plant cells?",
                        options: ["Mitochondria", "Chloroplast", "Nucleus", "Vacuole"],
                        correctAnswer: 1
                    },
                    {
                        id: 10,
                        question: "Which organelle stores water and nutrients?",
                        options: ["Lysosome", "Ribosome", "Vacuole", "Golgi Apparatus"],
                        correctAnswer: 2
                    }
                ],
                completedAt: new Date().toISOString(),
                dateTaken: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })
            };

            // Store mock result and redirect
            localStorage.setItem('current_quiz_result', JSON.stringify(mockResult));
            window.location.href = 'quiz_results.html';
        });
    });

});
