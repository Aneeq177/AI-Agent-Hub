// Import necessary packages
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const port = 3000;

// Use CORS and enable JSON body parsing
app.use(cors());
app.use(express.json());

// Serve static files from the parent directory (frontend files)
app.use(express.static(path.join(__dirname, '..')));

// Explicitly serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Load tools data
const toolsPath = path.join(__dirname, 'tools.json');
let toolsList = [];

try {
    const data = fs.readFileSync(toolsPath, 'utf8');
    toolsList = JSON.parse(data);
    console.log(`Loaded ${toolsList.length} tools from database.`);
} catch (err) {
    console.error('Error loading tools.json:', err);
}

// API Endpoint to get all tools
app.get('/api/tools', (req, res) => {
    res.json(toolsList);
});

// Fallback keyword-based recommendation function
function getKeywordBasedRecommendations(problemDescription, tools) {
    const keywords = {
        writing: ['write', 'writing', 'essay', 'paper', 'grammar', 'spell', 'paraphrase', 'rewrite', 'editing', 'compose', 'article'],
        math: ['math', 'mathematics', 'calculate', 'equation', 'algebra', 'geometry', 'calculus', 'problem', 'solve', 'number', 'formula'],
        tutoring: ['tutor', 'learn', 'study', 'homework', 'help', 'understand', 'explain', 'teaching', 'education', 'course'],
        research: ['research', 'paper', 'citation', 'reference', 'academic', 'scholar', 'article', 'sources', 'journal', 'study'],
        language: ['language', 'spanish', 'french', 'german', 'chinese', 'translate', 'translation', 'vocabulary', 'pronunciation'],
        assessment: ['quiz', 'test', 'exam', 'assessment', 'grade', 'plagiarism', 'check', 'verify', 'evaluation'],
        creative: ['design', 'create', 'image', 'video', 'presentation', 'visual', 'art', 'graphic', 'animation', 'edit']
    };

    const lowerDesc = problemDescription.toLowerCase();
    const scores = tools.map(tool => {
        let score = 0;
        const toolCategories = Array.isArray(tool.category) ? tool.category : [tool.category];
        const toolText = (tool.name + ' ' + tool.description).toLowerCase();

        // Give points for matching categories - more specific scoring
        for (const [category, words] of Object.entries(keywords)) {
            const hasKeyword = words.some(word => lowerDesc.includes(word));
            const hasCategory = toolCategories.includes(category);
            
            if (hasKeyword && hasCategory) {
                // Strong match: both keywords and category match
                score += 50;
            } else if (hasKeyword) {
                // Medium match: keyword found but no category match
                score += 20;
            } else if (hasCategory) {
                // Weak match: category matches but no keywords
                score += 5;
            }
        }

        // Check if any keyword appears in tool name or description
        const descWords = lowerDesc.split(/\s+/).filter(w => w.length > 3);
        for (const word of descWords) {
            if (toolText.includes(word)) {
                score += 15;
            }
        }

        // Only add rating as a small tiebreaker
        score += (tool.rating * 2);

        return { id: tool.id, score, name: tool.name };
    });

    // Sort by score and return top 3 IDs
    return scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(item => item.id);
}

// Define the API endpoint for recommendations
app.post('/recommend-tools', async (req, res) => {
    try {
        // Get the user's problem description
        const { problemDescription } = req.body;

        if (!problemDescription) {
            return res.status(400).json({ error: 'Problem description is required.' });
        }

        // Check if API key is set - if not, use fallback keyword matching
        if (!process.env.API_KEY) {
            console.log('API_KEY not set, using fallback keyword matching');
            const recommendedIds = getKeywordBasedRecommendations(problemDescription, toolsList);
            return res.json({ recommendedIds });
        }

        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // **** This is the Prompt Engineering part! ****
        const prompt = `
            You are an expert AI tool recommender for an educational website.
            Based on the user's problem description, your task is to recommend up to 3 tools from the provided list.
            The user's problem is: "${problemDescription}"

            Here is the list of available tools in JSON format:
            ${JSON.stringify(toolsList, null, 2)}

            Please analyze the user's problem and the tool descriptions.
            Respond with ONLY a JSON array of the recommended tool IDs. For example: [3, 8, 1].
            Do not include any other text, explanation, or markdown formatting. Just the JSON array of IDs.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up the response to ensure it's valid JSON
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        console.log("LLM Raw Response:", text); // For debugging

        // Parse the JSON array of IDs from the LLM's response
        const recommendedIds = JSON.parse(text);

        // Send the array of IDs back to the frontend
        res.json({ recommendedIds });

    } catch (error) {
        console.error('Error with Generative AI:', error);
        console.error('Error message:', error.message);

        // Fallback to keyword matching if AI fails
        console.log('AI failed, falling back to keyword matching');
        const recommendedIds = getKeywordBasedRecommendations(req.body.problemDescription, toolsList);
        res.json({ recommendedIds });
    }
});


// New endpoint for the conversational chatbot
app.post('/chat', async (req, res) => {
    try {
        const { conversationHistory } = req.body;

        if (!conversationHistory) {
            return res.status(400).json({ error: 'Conversation history is required.' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Get only the last 6 messages for context to save on tokens
        const recentHistory = conversationHistory.slice(-6);

        // **** The System Prompt for the Chatbot ****
        const prompt = `You are a friendly and helpful customer service chatbot for a website called "AI Agent Hub".
        Your knowledge is based on the provided list of AI tools. Your secondary knowledge is about the website itself.

        - Your primary job is to answer user questions about the specific AI tools in the list.
        - You can also answer general questions about the website, like "How do I submit a tool?".
        - Be concise and friendly.
        - If you don't know the answer, say "I'm not sure about that, but you can explore our tool directory for more information."
        - Do not make up information. Base your answers on the provided tool list.

        Here is the list of available tools:
        ${JSON.stringify(toolsList, null, 2)}

        Here is the recent conversation history:
        ${JSON.stringify(recentHistory, null, 2)}

        Now, please provide a helpful response to the last user message.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error('Error with Chatbot AI:', error);
        res.status(500).json({ error: 'Failed to get a chat response.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});