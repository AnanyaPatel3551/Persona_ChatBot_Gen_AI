// ═══════════════════════════════════════════════════
// App.jsx — Root component
// Manages: active persona, chat history, API calls
// ═══════════════════════════════════════════════════

import { useState, useCallback } from "react";
import PersonaSwitcher from "./components/PersonaSwitcher";
import ChatWindow from "./components/ChatWindow";
import SuggestionChips from "./components/SuggestionChips";
import "./App.css";

// ── Persona Config ──────────────────────────────────
// All persona metadata lives here — not in the backend
// The backend only needs the personaId to pick the right prompt
const PERSONAS = {
  anshuman: {
    id: "anshuman",
    name: "Anshuman Singh",
    title: "Co-founder & CTO, Scaler",
    avatar: "AS",
    color: "#f5a623",
    // Suggestion chips — quick-start questions for this persona
    suggestions: [
      "How do I stop failing coding interviews?",
      "Is DSA actually useful at real jobs?",
      "How should I approach system design?",
      "What's the biggest mistake junior devs make?",
    ],
  },
  abhimanyu: {
    id: "abhimanyu",
    name: "Abhimanyu Saxena",
    title: "Co-founder & CEO, Scaler",
    avatar: "AX",
    color: "#4fc3f7",
    suggestions: [
      "Why did you leave your NYC job to build InterviewBit?",
      "Should I join Scaler or self-study?",
      "How do I build a product people actually want?",
      "I feel stuck at a mediocre company. What do I do?",
    ],
  },
  kshitij: {
    id: "kshitij",
    name: "Kshitij Mishra",
    title: "Growth Lead, Scaler",
    avatar: "KM",
    color: "#81c784",
    suggestions: [
      "I'm from a tier-3 college. Do I even have a chance?",
      "How do I upskill without quitting my job?",
      "I've been rejected 15 times. What now?",
      "Will AI take over software engineering jobs?",
    ],
  },
};

// ── API Base URL ────────────────────────────────────
// In development → talks to local Express server
// In production → talks to deployed backend URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
  // Which persona is currently active
  const [activePersonaId, setActivePersonaId] = useState("anshuman");

  // Chat history: array of { role: "user" | "assistant", content: "..." }
  const [messages, setMessages] = useState([]);

  // Is the API call in progress? Controls typing indicator
  const [isLoading, setIsLoading] = useState(false);

  // Error message to show user if API fails
  const [error, setError] = useState(null);

  // ── Switch Persona ──────────────────────────────
  // When user switches persona, reset the conversation
  // Why: Each persona is a fresh context — mixing history would confuse the LLM
  const handlePersonaSwitch = useCallback((personaId) => {
    setActivePersonaId(personaId);
    setMessages([]);      // Clear chat history
    setError(null);       // Clear any errors
  }, []);

  // ── Send Message ────────────────────────────────
  const handleSendMessage = useCallback(async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    // 1. Add user message to UI immediately (optimistic update)
    const userMessage = { role: "user", content: messageText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setError(null);

    try {
      // 2. Call our Express backend
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          personaId: activePersonaId,
          // Send history EXCLUDING the message we just added
          // (backend adds current message itself via sendMessage())
          history: messages,
        }),
      });

      // 3. Parse response
      const data = await response.json();

      // 4. Handle API-level errors (e.g., rate limit, bad key)
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // 5. Add assistant reply to chat
      const assistantMessage = { role: "assistant", content: data.reply };
      setMessages([...updatedMessages, assistantMessage]);

    } catch (err) {
      // 6. Show user-friendly error — don't crash the app
      setError(err.message || "Failed to get a response. Please try again.");
      // Remove the user message if API failed (so they can retry)
      setMessages(messages);
    } finally {
      // 7. Always stop loading, whether success or failure
      setIsLoading(false);
    }
  }, [messages, activePersonaId, isLoading]);

  // ── Suggestion chip clicked ─────────────────────
  const handleSuggestionClick = useCallback((suggestion) => {
    handleSendMessage(suggestion);
  }, [handleSendMessage]);

  const activePersona = PERSONAS[activePersonaId];

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-logo">
          Scaler<span>AI</span>
        </div>
        <div className="active-persona-badge">
          <span className="dot" />
          {activePersona.name}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="app-main">
        {/* Persona switcher tabs */}
        <PersonaSwitcher
          personas={PERSONAS}
          activePersonaId={activePersonaId}
          onSwitch={handlePersonaSwitch}
        />

        {/* Chat messages area */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          error={error}
          activePersona={activePersona}
          onSendMessage={handleSendMessage}
        />

        {/* Quick-start suggestion chips — only shown when chat is empty */}
        {messages.length === 0 && !isLoading && (
          <SuggestionChips
            suggestions={activePersona.suggestions}
            onSelect={handleSuggestionClick}
          />
        )}
      </main>
    </div>
  );
}