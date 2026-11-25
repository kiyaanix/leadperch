// Entry point for the embeddable <script> build (vite.embed.config.js).
// Produces a single IIFE that self-mounts and exposes a prefixed global.
import { ChatWidgetAPI } from "./lib/mountWidget.js";

if (typeof window !== "undefined") {
    window.kiyaanix_cwc_widget = ChatWidgetAPI;

    const autoInit = () => {
        const scriptTag = document.currentScript || document.querySelector("script[data-kiyaanix-cwc-widget]");
        let cfg = window.kiyaanix_cwc_config || {};
        if (scriptTag?.dataset?.config) {
            try {
                cfg = { ...cfg, ...JSON.parse(scriptTag.dataset.config) };
            } catch (e) {
                console.warn("[Kiyaanix CWC] Could not parse data-config JSON:", e);
            }
        }
        if (window.kiyaanix_cwc_auto_init !== false) {
            ChatWidgetAPI.init(cfg);
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", autoInit);
    } else {
        autoInit();
    }
}

export default ChatWidgetAPI;
