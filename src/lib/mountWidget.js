import React from "react";
import { createRoot } from "react-dom/client";
import { ChatWidget } from "../components/ChatWidget.jsx";
import { defaultConfig, mergeConfig } from "./defaultConfig.js";

let currentConfig = { ...defaultConfig };
let root = null;
let hostEl = null;
let renderCount = 0;

function render() {
  if (!root) return;
  root.render(React.createElement(ChatWidget, { config: currentConfig, key: renderCount }));
}

function mount() {
  if (hostEl) return;
  hostEl = document.createElement("div");
  hostEl.id = "cw-widget-host";
  document.body.appendChild(hostEl);

  const shadow = hostEl.attachShadow({ mode: "open" });
  const mountPoint = document.createElement("div");
  shadow.appendChild(mountPoint);

  root = createRoot(mountPoint);
  render();
}

function unmount() {
  if (root) {
    root.unmount();
    root = null;
  }
  if (hostEl && hostEl.parentNode) hostEl.parentNode.removeChild(hostEl);
  hostEl = null;
}

export const ChatWidgetAPI = {
  init(userConfig = {}) {
    currentConfig = mergeConfig(defaultConfig, userConfig);
    renderCount++;
    if (!hostEl) mount();
    else render();
    return ChatWidgetAPI;
  },
  configure(partialConfig = {}) {
    currentConfig = mergeConfig(currentConfig, partialConfig);
    renderCount++;
    render();
    return ChatWidgetAPI;
  },
  open() {
    currentConfig = { ...currentConfig, startOpen: true };
    renderCount++;
    render();
    return ChatWidgetAPI;
  },
  close() {
    currentConfig = { ...currentConfig, startOpen: false };
    renderCount++;
    render();
    return ChatWidgetAPI;
  },
  destroy() {
    unmount();
    return ChatWidgetAPI;
  },
  getConfig() {
    return currentConfig;
  },
};
