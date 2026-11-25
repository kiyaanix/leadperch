import { CloseIcon } from "./Icons.jsx";

// Small preview bubble shown above the chat icon before the panel is
// opened (the "Hi there! Have a question?" card). Dismissable independently
// of the main panel; once closed (or once the panel is opened) it stays
// hidden for the rest of the session.
export function TeaserBubble({ message, onDismiss, onClick }) {
  if (!message) return null;

  return (
    <div className="cw-teaser" role="button" tabIndex={0} onClick={onClick}>
      <button
        type="button"
        className="cw-teaser-close"
        aria-label="Dismiss"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
      >
        <CloseIcon color="#9ca3af" />
      </button>
      <p className="cw-teaser-text">{message}</p>
    </div>
  );
}