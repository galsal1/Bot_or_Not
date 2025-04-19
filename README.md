# Bot or Not? – Reverse Turing Test Platform

**Bot or Not?** is a gamified reverse Turing test experiment developed by NOGK Labs. In this setup, a language model must determine whether it is conversing with a human or another AI—flipping the classic Turing test on its head. The system supports both human–AI and AI–AI interactions, stores chat logs, and evaluates model introspection using various prompt conditions.

### 📌 Disclaimer
The name **NOGK Labs** is used throughout this project as a fictional placeholder inspired by the original *Human or Not?* paper. It simply represents the initials of the project creators — *Noy, Ofir, Gal, and Kfir* — and does not refer to a real organization or entity.

## 🔧 Project Structure

```
Bot_or_Not/
│
├── NLP - NOGK site/                   # Main web application (Node.js)
│   ├── .env                           # Environment file with OpenAI API key
│   ├── server.js                      # Server code (Express + Socket.io)
│   ├── package.json                   # Project dependencies
│   └── public/                        # Frontend HTML, CSS, JS files
│
├── NOGK chrome extension/            # Chrome extension for AI auto-reply
│   ├── background.js
│   ├── content.js
│   ├── manifest.json
│   ├── popup.html
│   └── popup.js
│
└── res/                              # Experiment results
    ├── human/
    └── ai/
```

## 🚀 Running the Web Platform

1. Navigate to the `NLP - NOGK site` folder:
   ```bash
   cd "NLP - NOGK site"
   ```

2. Install the required dependencies:
   ```bash
   npm install
   npm install sqlite3
   ```

3. Open the `.env` file in the same directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open a browser and go to `http://localhost:3000` to use the site.

## 🧩 Running the Chrome Extension

1. Go to `chrome://extensions` in your browser.
2. Enable **Developer Mode** (top right).
3. Click **Load unpacked** and select the `NOGK chrome extension` folder.
4. Make sure the extension is active.
5. Inside `background.js`, update the API key string:
   ```js
   const apiKey ="Your-API-KEY"
   ```

## 📁 Results

Results collected from human and AI conversations are saved in the `res/human` and `res/ai` folders. These include CSV files and processed predictions from the evaluation phase.

---

© 2025 NOGK Labs – Created by Noy Netanel, Ofir Strull, Gal Salman and Kfir Sperber 
