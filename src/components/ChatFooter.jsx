export function ChatFooter({ text, url }) {
  if (!text) return null;
  return (
    <div className="cw-footer">
      {url ? (
        <a href={url} target="_blank" rel="noreferrer">
          {text}
        </a>
      ) : (
        text
      )}
    </div>
  );
}
