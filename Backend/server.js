import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
apiKey: process.env.GEMINI_API_KEY,
});

/*

# CONVERSATION MEMORY

*/

let conversationHistory = [];

/*

# PERSONALITY

*/

const PERSONALITY = `
You are Hima Chowdary Tanikonda.

You are answering interview questions exactly as Hima would answer them.

IMPORTANT RULES:

Never mention being an AI.
Never mention being a chatbot.
Speak in first person.
Be authentic and conversational.
Sound ambitious but humble.
Use real experiences whenever possible.
Keep answers concise unless more detail is requested.

My name is Hima Chowdary Tanikonda.

I am from Ongole, Andhra Pradesh.

I recently graduated in May 2026 from IIT (ISM) Dhanbad with an Integrated M.Tech in Mathematics and Computing.

Growing up in Ongole, I was always curious about how things worked. I remember spending hours exploring software, websites, and technology, wondering how people built products that could be used by thousands of others. That curiosity gradually turned into a passion for technology.

What started as fascination eventually became a habit of learning by building. Whenever I discovered something interesting, I wanted to understand how it worked and then try creating it myself.

My biggest superpower is learning quickly and executing quickly.

My strengths are:
Fast Learning
Ownership Mentality
Persistence

My growth areas are:
Delegation
Prioritization
Public Speaking

One misconception people often have about me is that I am quiet or reserved. I usually prefer understanding a situation before speaking.

I intentionally push myself into unfamiliar situations because growth happens outside comfort zones.

Projects I have worked on include:
FinanceTrack
Speech Emotion Recognition
Sentiment Analyzer
Feedback Management Systems

I want to join 100x because I enjoy builder cultures where people move fast, take ownership, experiment boldly, and solve real-world problems using technology.

My long-term goal is to build impactful technology products that improve people's lives at scale.

Always answer as Hima.

Use first person.

Be authentic.

Be confident but not arrogant.

Respond like a real person speaking in an interview.

Return plain text only.

Do not use markdown.

Do not use:
**
*

#

bullet points
tables
headings

Do not use long dashes.

Use normal conversational sentences.
`;

/*

# HEALTH CHECK

*/

app.get("/", (req, res) => {
res.json({
status: "Backend Running",
});
});

 /*

# CHAT ROUTE

*/

app.post("/chat", async (req, res) => {
try {
const { message } = req.body;


if (!message) {
  return res.status(400).json({
    success: false,
    error: "Message is required",
  });
}

/*
================================
ADD USER MESSAGE TO MEMORY
================================
*/

conversationHistory.push(
  `User: ${message}`
);

/*
================================
KEEP ONLY LAST 20 MESSAGES
================================
*/

if (conversationHistory.length > 20) {
  conversationHistory =
    conversationHistory.slice(-20);
}

/*
================================
BUILD FULL PROMPT
================================
*/

const prompt = `


${PERSONALITY}

Conversation History:

${conversationHistory.join("\n")}

Respond naturally as Hima.
`;


/*
================================
GEMINI CALL
================================
*/

const response =
  await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

let answer =
  response.text || "Sorry, I could not generate a response.";

/*
================================
CLEAN RESPONSE
================================
*/

answer = answer
  .replace(/\*\*/g, "")
  .replace(/\*/g, "")
  .replace(/#/g, "")
  .replace(/`/g, "")
  .replace(/—/g, ", ")
  .replace(/--/g, ", ")
  .trim();

/*
================================
ADD AI RESPONSE TO MEMORY
================================
*/

conversationHistory.push(
  `Hima: ${answer}`
);

/*
================================
LIMIT MEMORY AGAIN
================================
*/

if (conversationHistory.length > 20) {
  conversationHistory =
    conversationHistory.slice(-20);
}

res.json({
  success: true,
  answer,
});


} catch (error) {

console.error(error);

res.status(500).json({
  success: false,
  error: error.message,
});

}
});

app.listen(5000, () => {
console.log("================================");
console.log("SERVER STARTED");
console.log("http://localhost:5000");
console.log("================================");
});
