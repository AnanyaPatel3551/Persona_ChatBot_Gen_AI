// SuggestionChips.jsx
// Quick-start question buttons shown when chat is empty

import "./SuggestionChips.css";

export default function SuggestionChips({ suggestions, onSelect }) {
  return (
    <div className="suggestion-chips">
      <p className="chips-label">Try asking</p>
      <div className="chips-row">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="chip"
            onClick={() => onSelect(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}