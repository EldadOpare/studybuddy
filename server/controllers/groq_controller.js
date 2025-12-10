const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';


// i proxy the Groq API through my server so i can keep the API key secure
// users send their quiz topic here and get back generated questions
exports.generateFromTopic = async (req, res) => {
    try {
        const { title, topic, questionCount, difficulty } = req.body;

        if (!topic || !questionCount || !difficulty) {
            return res.status(400).json({ error: 'Missing required fields: topic, questionCount, difficulty' });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Groq API key not configured on server' });
        }


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
- Title: "${title || topic + ' Quiz'}"
- Difficulty: ${difficulty}
- Make questions educational and accurate`;


        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
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
            console.error('Groq API error:', errorData);
            return res.status(response.status).json({
                error: errorData.error?.message || `Groq API error: ${response.status}`
            });
        }

        const data = await response.json();
        const quizData = JSON.parse(data.choices[0].message.content);

        res.json(quizData);
    } catch (error) {
        console.error('Error generating quiz from topic:', error);
        res.status(500).json({ error: error.message || 'Failed to generate quiz' });
    }
};


// this one generates quizzes from user's notes or PDF content
// had to truncate long texts to stay within API token limits
exports.generateFromText = async (req, res) => {
    try {
        const { title, textContent, questionCount, difficulty } = req.body;

        if (!textContent || !questionCount || !difficulty) {
            return res.status(400).json({ error: 'Missing required fields: textContent, questionCount, difficulty' });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Groq API key not configured on server' });
        }


        const maxChars = 15000;
        const truncatedText = textContent.length > maxChars
            ? textContent.substring(0, maxChars) + '...[content truncated]'
            : textContent;

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
- Questions should be based ONLY on the provided content
- Questions should test understanding of key concepts
- Options should be plausible but only one should be correct
- Return ONLY the JSON object, no additional text`;


        const userPrompt = `Based on the following content, generate a ${difficulty} difficulty quiz:

CONTENT:
${truncatedText}

Requirements:
- Generate exactly ${questionCount} questions
- Title: "${title || 'Content Quiz'}"
- Difficulty: ${difficulty}
- Questions must be based on the provided content`;

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
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
            console.error('Groq API error:', errorData);
            return res.status(response.status).json({
                error: errorData.error?.message || `Groq API error: ${response.status}`
            });
        }

        const data = await response.json();
        const quizData = JSON.parse(data.choices[0].message.content);

        res.json(quizData);
    } catch (error) {
        console.error('Error generating quiz from text:', error);
        res.status(500).json({ error: error.message || 'Failed to generate quiz' });
    }
};
