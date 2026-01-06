AI Tools Hub 🧠
AI Tools Hub is a full-stack web platform designed to help people from all backgrounds discover AI tools tailored to their specific needs. It features a curated directory and an intelligent AI Finder powered by Google Gemini.

<img width="1874" height="888" alt="image" src="https://github.com/user-attachments/assets/cf70bb28-a114-4dd5-998a-c20f9885a114" />
<img width="1875" height="888" alt="image" src="https://github.com/user-attachments/assets/a53ba469-1b7c-40f7-adbc-b8eed11e1d22" />
<img width="1443" height="875" alt="image" src="https://github.com/user-attachments/assets/e99c62ca-fcad-4bf8-bff7-01cf5a00f596" />



🚀 Key Features
AI Tool Finder: An interactive search where users describe a problem, and the Google Gemini API suggests the most relevant tools.

Curated Directory: A categorized list of AI tools for Tutoring, Writing, Math, Language, and more.

AI Chat Assistant: A built-in chatbot to answer community questions and help navigate the site.

Community Submissions: A portal for users to contribute new tools to the database.

Keyword Fallback: If the AI API is unavailable, the system automatically switches to an internal keyword-matching algorithm to ensure recommendations still work.

🛠️ Technical Stack
Frontend: HTML5, CSS3 (Custom Inter font & Glassmorphism UI), and Vanilla JavaScript.

Backend: Node.js with Express.

AI Integration: Google Generative AI (Gemini 1.5 Flash).

Environment Management: Dotenv for secure API key handling.

📁 Project Structure
Plaintext

AI-Tools-Hub/
├── server.js          # Node.js/Express backend & AI logic
├── index.html         # Frontend structure & UI
├── script.js          # Frontend interactivity
├── style.css          # Modern responsive styling
├── tools.json         # Database of AI tools
└── .env               # API keys (not included in repo)
⚙️ Setup Instructions
Install Dependencies:

Bash

npm install express @google/generative-ai dotenv cors
Configure API Key:

Create a .env file in the root.

Add your Google Gemini API key: API_KEY=your_key_here.

Run the Server:

Bash

node server.js
Access the App: Open http://localhost:3000 in your browser.

🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request or open an issue for new tool suggestions.
