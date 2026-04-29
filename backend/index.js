require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

// Initialize Grok client
// Grok uses OpenAI-compatible API, just with a different baseURL
const client = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

const personas = require("./personas");

app.post("/api/chat", async (req, res) => {
  const { message, personaId, history } = req.body;

  if (!message || !personaId) {
    return res.status(400).json({
      error: "Message and personaId are required"
    });
  }

  const systemPrompt = personas[personaId];

  if (!systemPrompt) {
    return res.status(400).json({
      error: "Invalid persona selected"
    });
  }

  try {
    // Convert history to OpenAI format
    // Format: [{ role: "user" | "assistant", content: "..." }]
    const messages = [
      // System prompt goes first — tells Grok who to be
      { role: "system", content: systemPrompt },
      // Then the conversation history
      ...history.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
      // Finally the new user message
      { role: "user", content: message },
    ];

    // Call Grok API
    const completion = await client.chat.completions.create({
      model: "grok-3-mini",  // Free tier model
      messages: messages,
      max_tokens: 1024,
    });

    // Extract response text
    const responseText = completion.choices[0].message.content;

    res.json({ reply: responseText });

  } catch (error) {
    console.error("=== GROK ERROR ===");
    console.error("Message:", error.message);
    console.error("Status:", error.status);
    console.error("==================");

    if (error.status === 401) {
      return res.status(401).json({
        error: "Invalid API key. Check your .env file."
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: "Rate limit hit. Please wait a moment and try again."
      });
    }

    res.status(500).json({
      error: error.message || "Something went wrong. Please try again."
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "Server is running ✅" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});