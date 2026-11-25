import { useState, useMemo, useCallback } from "react";
import { ChatBubble } from "./ChatBubble.jsx";
import { ChatPanel } from "./ChatPanel.jsx";
import { TeaserBubble } from "./TeaserBubble.jsx";
import { buildWidgetCss } from "../lib/widgetStyles.js";

export function ChatWidget({ config }) {
  const [open, setOpen] = useState(!!config.startOpen);
  const [teaserDismissed, setTeaserDismissed] = useState(false);
  const showTeaser = !!config.teaserMessage && !open && !teaserDismissed;

  const positionStyle = useMemo(() => {
    const side = config.position === "bottom-left" ? "left" : "right";
    return {
      position: "fixed",
      bottom: `${config.offset.y}px`,
      [side]: `${config.offset.x}px`,
      zIndex: config.zIndex,
      fontFamily: config.theme.fontFamily,
    };
  }, [config.position, config.offset, config.zIndex, config.theme.fontFamily]);

  const css = useMemo(() => buildWidgetCss(config.theme, config), [config.theme, config]);

  const toggleOpen = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next && config.onOpen) config.onOpen();
      if (!next && config.onClose) config.onClose();
      return next;
    });
  }, [config]);

  const openFromTeaser = useCallback(() => {
    setTeaserDismissed(true);
    if (!open) toggleOpen();
  }, [open, toggleOpen]);

  return (
    <div style={positionStyle} className="cw-root">
      <style>{css}</style>
      {open && <ChatPanel config={config} onClose={toggleOpen} />}
      {showTeaser && (
        <TeaserBubble
          message={config.teaserMessage}
          onDismiss={() => setTeaserDismissed(true)}
          onClick={openFromTeaser}
        />
      )}
      <ChatBubble open={open} iconColor={config.theme.bubbleIconColor} onClick={toggleOpen} />
    </div>
  );
}