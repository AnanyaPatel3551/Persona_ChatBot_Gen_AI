// ChatWindow.jsx
// The main chat area — messages, input, typing indicator, errors

import { useState, useRef, useEffect } from "react";
import TypingIndicator from "./TypingIndicator";
import "./ChatWindow.css";

export default function ChatWindow({
  messages, isLoading, error, activePersona, onSendMessage
}) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null); // For auto-scrolling to bottom
  const inputRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue);
    setInputValue(""); // Clear input after sending
  };

  const handleKeyDown = (e) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-window">
      {/* ── Messages Area ── */}
      <div className="messages-area">
        {/* Empty state — shown when no messages yet */}
        {messages.length === 0 && !isLoading && (
          <div className="empty-state">
            <div
              className="empty-avatar"
              style={{ "--persona-color": activePersona.color }}
            >
              {activePersona.avatar}
            </div>
            <h2 className="empty-name">{activePersona.name}</h2>
            <p className="empty-subtitle">{activePersona.title}</p>
            <p className="empty-hint">Ask me anything — or pick a suggestion below</p>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-row ${msg.role === "user" ? "user" : "assistant"}`}
          >
            {/* Avatar — only shown for assistant messages */}
            {msg.role === "assistant" && (
              <div
                className="message-avatar"
                style={{ "--persona-color": activePersona.color }}
              >
                {activePersona.avatar}
              </div>
            )}
            <div className="message-bubble">
              {/* Render message text, preserving newlines */}
              {msg.content.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  {i < msg.content.split("\n").length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* Typing indicator while waiting for API */}
        {isLoading && (
          <div className="message-row assistant">
            <div
              className="message-avatar"
              style={{ "--persona-color": activePersona.color }}
            >
              {activePersona.avatar}
            </div>
            <TypingIndicator />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        {/* Invisible div at the bottom — scroll target */}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ── */}
      <form className="input-area" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          className="message-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask ${activePersona.name.split(" ")[0]} anything...`}
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="send-button"
          disabled={isLoading || !inputValue.trim()}
          style={{ "--persona-color": activePersona.color }}
        >
          {isLoading ? (
            <span className="spinner" />
          ) : (
            // Send arrow icon
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}