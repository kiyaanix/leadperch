import { CheckIcon } from "./Icons.jsx";

export function SuccessMessage({ heading, message, name, onReset }) {
  const personalized = name
    ? message.replace("{name}", name)
    : message.replace(/,?\s*\{name\}/, "");

  return (
    <div className="cw-success">
      <div className="cw-success-icon">
        <CheckIcon />
      </div>
      <div className="cw-success-heading">{heading}</div>
      <p className="cw-success-text">{personalized}</p>
      <button type="button" className="cw-link-btn" onClick={onReset}>
        Send another message
      </button>
    </div>
  );
}