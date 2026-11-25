export const defaultConfig = {
  // ---- Identity / copy ----------------------------------------------------
  companyName: "Your Company",
  tagline: "Typically replies within a few hours",
  greeting: "Hi there! Have a question? Leave your details and we'll get right back to you.",
  // Small dismissable card shown above the bubble before the panel is
  // opened (see image 1). Set to "" or null to disable it entirely.
  teaserMessage: "Hi there! Have a question? Leave your details and we'll get right back to you.",
  poweredByText: "Powered by Chat Widget Connect",
  poweredByUrl: "",
  logoUrl: "",
  bannerImageUrl: "",

  // ---- Behaviour -----------------------------------------------------------
  startOpen: false,
  position: "bottom-right", // bottom-right | bottom-left
  offset: { x: 24, y: 24 },
  zIndex: 999999,

  // ---- Theme -----------------------------------------------------------------
  theme: {
    primaryColor: "#1a1d29",
    accentColor: "#1a1d29",
    bubbleColor: "#1a1d29",
    bubbleIconColor: "#ffffff",
    backgroundColor: "#ffffff",
    textColor: "#1a1d29",
    mutedTextColor: "#6b7280",
    borderColor: "#e5e7eb",
    errorColor: "#dc2626",
    borderRadius: 16,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    buttonTextColor: "#ffffff",
  },

  // ---- Form fields (data-driven; validated via zod, see lib/buildSchema.js)
  fields: [
    { id: "name", type: "text", label: "Your name", required: true, minLength: 2 },
    { id: "email", type: "email", label: "Email", required: true },
    { id: "phone", type: "tel", label: "Phone", required: false },
    { id: "message", type: "textarea", label: "How can we help?", required: true, minLength: 5 },
  ],

  // The host may inject the current visitor before initialization.
  visitorContext: null,
  // Shown above the form when logged in; {name}/{email} are replaced
  // with what the backend reports. Set to "" to show nothing.
  loggedInNoteTemplate: "Sending as {name} ({email})",

  submitButtonText: "Send",
  // {name} is replaced with the value of whichever field id matches
  // `nameFieldId` (dropped cleanly if that field is empty/absent).
  successHeading: "Message sent!",
  successMessage: "Thanks, {name}, we'll get right back to you.",
  nameFieldId: "name",
  errorMessage: "Something went wrong. Please try again.",
  // Shown instead of errorMessage specifically on a 403 response — the
  // common signature of an expired WordPress REST nonce on a long-open tab.
  // Set to "" to just fall back to errorMessage as before.
  staleSessionMessage: "Your session expired — please refresh the page and try again.",

  // ---- Submission ------------------------------------------------------------
  endpoint: "",
  method: "POST",
  headers: {},
  extraPayload: {},
  transformPayload: null,

  // ---- Metadata collection ----------------------------------------------------
  metadata: {
    // Instant, free, no network call: page URL, referrer, UA-derived
    // browser/OS/device, timezone, language, screen size.
    collectBasic: true,
    // No IP/country lookup here on purpose: the widget makes no
    // third-party requests. Determine IP/country server-side.
  },

  // ---- Callbacks (set programmatically) ----------------------------------------
  onOpen: null,
  onClose: null,
  onSubmit: null,
  onSuccess: null,
  onError: null,
};

export function mergeConfig(base, override = {}) {
  const merged = { ...base, ...override };
  merged.theme = { ...base.theme, ...(override.theme || {}) };
  merged.offset = { ...base.offset, ...(override.offset || {}) };
  merged.headers = { ...base.headers, ...(override.headers || {}) };
  merged.extraPayload = { ...base.extraPayload, ...(override.extraPayload || {}) };
  merged.metadata = { ...base.metadata, ...(override.metadata || {}) };
  merged.fields = override.fields || base.fields;
  return merged;
}
