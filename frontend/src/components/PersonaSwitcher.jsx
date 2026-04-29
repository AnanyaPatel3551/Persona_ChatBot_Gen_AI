// PersonaSwitcher.jsx
// The tab bar that lets users switch between the 3 personas

import "./PersonaSwitcher.css";

export default function PersonaSwitcher({ personas, activePersonaId, onSwitch }) {
  return (
    <div className="persona-switcher">
      {Object.values(personas).map((persona) => (
        <button
          key={persona.id}
          className={`persona-tab ${activePersonaId === persona.id ? "active" : ""}`}
          onClick={() => onSwitch(persona.id)}
          // Dynamic accent color per persona
          style={{ "--persona-color": persona.color }}
        >
          {/* Avatar circle with initials */}
          <span className="persona-avatar">{persona.avatar}</span>
          <span className="persona-info">
            <span className="persona-name">{persona.name}</span>
            <span className="persona-title">{persona.title}</span>
          </span>
        </button>
      ))}
    </div>
  );
}