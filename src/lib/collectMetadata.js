/**
 * Client-side metadata collection.
 *
 * Free, instant, and no network call: page URL, referrer, UA-derived
 * browser/OS/device, screen size, timezone, language.
 *
 * The widget deliberately makes no third-party requests. IP address and
 * country must be determined server-side at your `endpoint` from the
 * incoming request (the WordPress plugin does this) — anything the
 * browser reports about them can be spoofed.
 */

// ---- UA parsing (lightweight, dependency-free) ---------------------------
function parseBrowser(ua) {
  const rules = [
    { name: "Edge", re: /Edg\/([\d.]+)/ },
    { name: "Chrome", re: /Chrome\/([\d.]+)/ },
    { name: "Firefox", re: /Firefox\/([\d.]+)/ },
    { name: "Safari", re: /Version\/([\d.]+).*Safari/ },
    { name: "Opera", re: /OPR\/([\d.]+)/ },
    { name: "Internet Explorer", re: /MSIE ([\d.]+)/ },
  ];
  for (const rule of rules) {
    const match = ua.match(rule.re);
    if (match) return { name: rule.name, version: match[1] };
  }
  return { name: "Unknown", version: "" };
}

function parseOS(ua) {
  if (/Windows NT 10/.test(ua)) return "Windows 10/11";
  if (/Windows NT/.test(ua)) return "Windows";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}

function parseDeviceType(ua) {
  if (/Mobi|Android(?!.*Tablet)/i.test(ua) && !/iPad/i.test(ua)) return "mobile";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  return "desktop";
}

/** Synchronous, zero-network metadata. Always safe to call. */
export function collectBasicMetadata() {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const browser = parseBrowser(ua);

  return {
    pageUrl: typeof window !== "undefined" ? window.location.href : "",
    pageTitle: typeof document !== "undefined" ? document.title : "",
    referrer: typeof document !== "undefined" ? document.referrer : "",
    browserName: browser.name,
    browserVersion: browser.version,
    os: parseOS(ua),
    deviceType: parseDeviceType(ua),
    userAgent: ua,
    language: typeof navigator !== "undefined" ? navigator.language : "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenWidth: typeof window !== "undefined" ? window.screen.width : null,
    screenHeight: typeof window !== "undefined" ? window.screen.height : null,
    submittedAt: new Date().toISOString(),
  };
}
