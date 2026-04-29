// TypingIndicator.jsx
// Animated dots shown while waiting for the AI response

import "./TypingIndicator.css";

export default function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}