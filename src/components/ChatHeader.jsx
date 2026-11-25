import { CloseIcon } from "./Icons.jsx";

export function ChatHeader({ config, onClose }) {
  return (
    <div
      className="cw-header"
      style={{
        backgroundImage: config.bannerImageUrl ? `url(${config.bannerImageUrl})` : undefined,
      }}
    >
      <div
        className="cw-header-overlay"
        style={{
          background: config.bannerImageUrl
            ? "linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.35))"
            : "transparent",
        }}
      >
        <div className="cw-header-row">
          {config.logoUrl ? <img src={config.logoUrl} alt="" className="cw-logo" /> : null}
          <div>
            <div className="cw-company">{config.companyName}</div>
            {config.tagline ? <div className="cw-tagline">{config.tagline}</div> : null}
          </div>
        </div>
        <button type="button" className="cw-close-btn" aria-label="Close chat" onClick={onClose}>
          <CloseIcon color="#ffffff" />
        </button>
      </div>
    </div>
  );
}
