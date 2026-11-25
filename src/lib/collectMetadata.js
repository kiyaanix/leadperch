/**
 * Client-side metadata collection.
 *
 * Two tiers:
 *  1. Free, instant, no network call: page URL, referrer, UA-derived
 *     browser/OS/device, screen size, timezone, language.
 *  2. Optional network call to an IP-geolocation service to attach
 *     ip/country/city. This is best-effort and can be disabled — the
 *     canonical, trustworthy IP capture should happen server-side by
 *     reading the request's IP at your `endpoint` (client-reported IP
 *     can be spoofed). We still offer it because many teams just want
 *     country-level context without standing up their own lookup.
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

const geoCache = { promise: null };

/**
 * Best-effort IP/country lookup via a swappable third-party API.
 * Cached per page load so multiple submissions don't refetch.
 *
 * @param {object} opts
 * @param {boolean} opts.enabled - skip entirely if false (default true)
 * @param {string} opts.url - geolocation endpoint returning JSON
 * @param {(json:any) => {ip:string,country:string,countryCode:string,city:string}} opts.parse
 */
export function collectGeoMetadata(opts = {}) {
  const { enabled = true, url = "https://ipapi.co/json/", parse = defaultGeoParse } = opts;

  if (!enabled) return Promise.resolve({});

  if (!geoCache.promise) {
    geoCache.promise = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Geo lookup failed: ${res.status}`);
        return res.json();
      })
      .then(parse)
      .catch((err) => {
        console.warn("[ChatWidget] IP/country lookup failed:", err.message);
        return {};
      });
  }
  return geoCache.promise;
}

function defaultGeoParse(json) {
  return {
    ip: json.ip || "",
    country: json.country_name || "",
    countryCode: json.country_code || "",
    city: json.city || "",
    region: json.region || "",
  };
}

/**
 * Full metadata: basic (instant) + geo (async, best-effort).
 * Never rejects — geo failures resolve to {}.
 */
export async function collectFullMetadata(geoOptions) {
  const basic = collectBasicMetadata();
  const geo = await collectGeoMetadata(geoOptions);
  return { ...basic, ...geo };
}
