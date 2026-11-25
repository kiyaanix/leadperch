import { BubbleIcon, CloseIcon } from "./Icons.jsx";

export function ChatBubble({ open, iconColor, onClick }) {
  return (
    <button
      type="button"
      className="cw-bubble"
      onClick={onClick}
      aria-label={open ? "Close chat" : "Open chat"}
    >
      {open ? <CloseIcon color={iconColor} /> : <BubbleIcon color={iconColor} />}
    </button>
  );
}
