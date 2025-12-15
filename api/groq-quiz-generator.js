
// I configured the Groq API settings for quiz generation and chat
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE';
const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';


// I'm using this to generate quiz questions when user gives me a topic
async function generateQuizFromPrompt({ title, topic, questionCount, difficulty }) {
    const aiSystemPrompt = `You are a quiz generation expert. Generate educational multiple-choice quizzes based on the given topic.

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

    const userRequest = `Generate a ${difficulty} difficulty quiz about: ${topic}

Requirements:
- Generate exactly ${questionCount} questions
- Title: "${title}"
- Difficulty: ${difficulty}
- All questions should be multiple choice with 4 options
- Make questions educational and accurate`;

    try {
        const apiResponse = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: 'system', content: aiSystemPrompt },
                    { role: 'user', content: userRequest }
                ],
                temperature: 0.7,
                max_tokens: 4096,
                response_format: { type: 'json_object' }
            })
        });

        if (!apiResponse.ok) {
            throw new Error(`Groq API error: ${apiResponse.status} ${apiResponse.statusText}`);
        }

        const responseData = await apiResponse.json();
        const generatedQuiz = JSON.parse(responseData.choices[0].message.content);

        // I added metadata to the quiz so we can track when it was created
        generatedQuiz.id = 'quiz_' + Date.now();
        generatedQuiz.type = 'prompt';
        generatedQuiz.createdAt = new Date().toISOString();
        generatedQuiz.dateCreated = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        return generatedQuiz;

    } catch (error) {
        throw error;
    }
}



// this generates quiz from PDF or note content the user provides
async function generateQuizFromPDF({ title, pdfText, questionCount, difficulty }) {
    const aiSystemPrompt = `You are a quiz generation expert. Generate educational multiple-choice quizzes based on the provided document content.

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

    // I limited the text to 6000 characters so the API request doesn't get too large
    const userRequest = `Based on the following document content, generate a ${difficulty} difficulty quiz:

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
        const apiResponse = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: 'system', content: aiSystemPrompt },
                    { role: 'user', content: userRequest }
                ],
                temperature: 0.7,
                max_tokens: 4096,
                response_format: { type: 'json_object' }
            })
        });

        if (!apiResponse.ok) {
            throw new Error(`Groq API error: ${apiResponse.status} ${apiResponse.statusText}`);
        }

        const responseData = await apiResponse.json();
        const generatedQuiz = JSON.parse(responseData.choices[0].message.content);

        generatedQuiz.id = 'quiz_' + Date.now();
        generatedQuiz.type = 'pdf';
        generatedQuiz.createdAt = new Date().toISOString();
        generatedQuiz.dateCreated = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        return generatedQuiz;

    } catch (error) {
        throw error;
    }
}


// Handle chat requests from Buddy widget
async function handleChatRequest(prompt) {
    const aiSystemPrompt = `You are Buddy, a helpful and friendly study assistant. You help students with their questions, provide explanations, study tips, and encouragement. Be concise, clear, and supportive.`;

    try {
        const apiResponse = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: 'system', content: aiSystemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!apiResponse.ok) {
            throw new Error(`Groq API error: ${apiResponse.status} ${apiResponse.statusText}`);
        }

        const responseData = await apiResponse.json();
        return responseData.choices[0].message.content;

    } catch (error) {
        throw error;
    }
}


// I set up this handler for Vercel serverless deployment
export default async function handler(req, res) {
    // I allowed CORS so the frontend can call this API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, title, topic, pdfText, questionCount, difficulty } = req.body;

        // If it's a simple chat prompt from the Buddy widget
        if (prompt && !title && !topic && !pdfText) {
            const chatResponse = await handleChatRequest(prompt);
            return res.status(200).json({ result: chatResponse });
        }

        // If it's a quiz generation from prompt
        if (topic) {
            const quiz = await generateQuizFromPrompt({ title, topic, questionCount, difficulty });
            return res.status(200).json(quiz);
        }

        // If it's a quiz generation from PDF
        if (pdfText) {
            const quiz = await generateQuizFromPDF({ title, pdfText, questionCount, difficulty });
            return res.status(200).json(quiz);
        }

        return res.status(400).json({ error: 'Invalid request parameters' });

    } catch (error) {
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateQuizFromPrompt,
        generateQuizFromPDF,
        handleChatRequest
    };
}
