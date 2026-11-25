export function buildWidgetCss(theme, config) {
  const side = config.position === "bottom-left" ? "left" : "right";
  return `
    .cw-root, .cw-root * { box-sizing: border-box; }
    .cw-bubble {
      width: 60px; height: 60px; border-radius: 50%;
      background: ${theme.bubbleColor}; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 20px rgba(0,0,0,0.25);
      float: ${side};
      transition: transform 0.15s ease;
    }
    .cw-bubble:hover { transform: scale(1.06); }
    .cw-teaser {
      position: absolute;
      bottom: 76px; ${side}: 0;
      width: 240px; max-width: calc(100vw - 32px);
      background: ${theme.backgroundColor};
      color: ${theme.textColor};
      border-radius: ${theme.borderRadius}px;
      box-shadow: 0 8px 28px rgba(0,0,0,0.16);
      padding: 14px 28px 14px 16px;
      cursor: pointer;
      animation: cw-pop 0.16s ease-out;
    }
    .cw-teaser-text { margin: 0; font-size: 13.5px; line-height: 1.45; }
    .cw-teaser-close {
      position: absolute; top: 8px; right: 8px;
      background: none; border: none; cursor: pointer;
      padding: 2px; line-height: 0;
    }
    .cw-panel {
      position: absolute;
      bottom: 76px; ${side}: 0;
      width: 340px; max-width: calc(100vw - 32px);
      background: ${theme.backgroundColor};
      border-radius: ${theme.borderRadius}px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.18);
      overflow: hidden;
      display: flex; flex-direction: column;
      max-height: 70vh;
      animation: cw-pop 0.16s ease-out;
    }
    @keyframes cw-pop {
      from { opacity: 0; transform: translateY(8px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .cw-header {
      background-color: ${theme.primaryColor};
      background-size: cover; background-position: center;
      padding: 0;
      position: relative;
    }
    .cw-header-overlay {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 8px; padding: 18px 16px;
    }
    .cw-header-row { display: flex; align-items: center; gap: 10px; }
    .cw-logo { width: 32px; height: 32px; border-radius: 8px; object-fit: cover; }
    .cw-company { color: #fff; font-weight: 600; font-size: 15px; line-height: 1.3; }
    .cw-tagline { color: rgba(255,255,255,0.75); font-size: 12px; margin-top: 2px; }
    .cw-close-btn {
      background: rgba(255,255,255,0.15); border: none; border-radius: 50%;
      width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0;
    }
    .cw-body { padding: 16px; overflow-y: auto; }
    .cw-greeting {
      background: #f3f4f6; color: ${theme.textColor};
      border-radius: 12px; padding: 12px 14px; font-size: 13.5px; line-height: 1.5;
      margin-bottom: 14px;
    }
    .cw-form { display: flex; flex-direction: column; gap: 10px; }
    .cw-field { display: flex; flex-direction: column; gap: 4px; }
    .cw-input {
      width: 100%; padding: 10px 12px; font-size: 13.5px;
      border: 1px solid ${theme.borderColor}; border-radius: 10px;
      background: ${theme.backgroundColor}; color: ${theme.textColor};
      font-family: inherit; outline: none;
    }
    .cw-input:focus { border-color: ${theme.accentColor}; }
    .cw-input-error { border-color: ${theme.errorColor}; }
    textarea.cw-input { resize: vertical; min-height: 64px; }
    .cw-field-error { color: ${theme.errorColor}; font-size: 12px; }
    .cw-submit-btn {
      background: ${theme.accentColor}; color: ${theme.buttonTextColor};
      border: none; border-radius: 10px; padding: 11px 14px;
      font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 4px;
    }
    .cw-submit-btn:disabled { opacity: 0.6; cursor: default; }
    .cw-error { color: ${theme.errorColor}; font-size: 12.5px; }
    .cw-success { text-align: center; padding: 20px 4px 12px; color: ${theme.textColor}; }
    .cw-success-icon {
      width: 44px; height: 44px; border-radius: 50%;
      background: ${theme.accentColor};
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 14px;
    }
    .cw-success-heading { font-size: 15.5px; font-weight: 700; margin-bottom: 6px; }
    .cw-success-text { font-size: 13.5px; color: ${theme.mutedTextColor}; margin: 0; }
    .cw-link-btn {
      background: none; border: none; color: ${theme.accentColor};
      text-decoration: underline; cursor: pointer; font-size: 13px; margin-top: 8px;
    }
    .cw-footer {
      text-align: center; font-size: 11px; color: ${theme.mutedTextColor};
      padding: 8px; border-top: 1px solid ${theme.borderColor};
    }
    .cw-footer a { color: inherit; }
    .cw-logged-in-note {
      font-size: 12px; color: ${theme.mutedTextColor};
      background: #f3f4f6; border-radius: 8px; padding: 8px 10px;
      margin-bottom: 2px;
    }
    .cw-honeypot {
      position: absolute !important;
      left: -9999px !important;
      width: 1px; height: 1px;
      opacity: 0; pointer-events: none;
    }
  `;
}