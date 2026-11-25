import { ChatWidgetAPI } from "./lib/mountWidget.js";

window.kiyaanix_cwc_widget = ChatWidgetAPI;

window.kiyaanix_cwc_config = {
    companyName: "International Meta Consciousness Academy",
    tagline: "Typically replies within a few hours",
    greeting: "Hi there! Have a question? Leave your details and we'll get right back to you.",
    poweredByText: null,
    poweredByUrl: null,

    fields: [
        { id: "name", type: "text", label: "Your name", required: true, minLength: 2 },
        { id: "email", type: "email", label: "Email", required: true },
        { id: "phone", type: "tel", label: "Phone", required: false },
        { id: "message", type: "textarea", label: "How can we help?", required: true, minLength: 5 },
    ],

    // Demo mode (no endpoint) — logs the full payload including metadata.
    endpoint: "",
    onSuccess: (res) => console.log("[demo] submitted:", res),
};

ChatWidgetAPI.init(window.kiyaanix_cwc_config);
