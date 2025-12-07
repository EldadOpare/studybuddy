


// Configuration
const GROQ_API_KEY = 'YOUR_GROQ_API_KEY_HERE';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Recommended model: llama-3.3-70b-versatile (fast and accurate)
const GROQ_MODEL = 'llama-3.3-70b-versatile';



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
- Difficulty should match the requested level
- Return ONLY the JSON object, no additional text`;

    const userPrompt = `Generate a ${difficulty} difficulty quiz about: ${topic}

Requirements:
- Generate exactly ${questionCount} questions
- Title: "${title}"
- Difficulty: ${difficulty}
- All questions should be multiple choice with 4 options
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
            throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const quizData = JSON.parse(data.choices[0].message.content);

        // Add unique ID to the quiz
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
        console.error('Error generating quiz from prompt:', error);
        throw error;
    }
}



async function generateQuizFromPDF({ title, pdfText, questionCount, difficulty }) {
    const systemPrompt = `You are a quiz generation expert. Generate educational multiple-choice quizzes based on the provided document content.

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
- Questions should be based on the document content
- Options should be plausible but only one should be correct
- Difficulty should match the requested level
- Return ONLY the JSON object, no additional text`;

    const userPrompt = `Based on the following document content, generate a ${difficulty} difficulty quiz:

DOCUMENT CONTENT:
${pdfText.substring(0, 6000)}

Requirements:
- Generate exactly ${questionCount} questions
- Title: "${title}"
- Difficulty: ${difficulty}
- All questions should be multiple choice with 4 options
- Questions must be based on the document content
- Make questions educational and test comprehension of the material`;

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
            throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const quizData = JSON.parse(data.choices[0].message.content);

        // Add unique ID to the quiz
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
        console.error('Error generating quiz from PDF:', error);
        throw error;
    }
}



async function extractTextFromPDF(pdfFile) {


    throw new Error('PDF text extraction not implemented. Please add a PDF parsing library.');
}

// Export functions for use in the application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateQuizFromPrompt,
        generateQuizFromPDF,
        extractTextFromPDF
    };
}
