# LeadPerch widget

A floating chat bubble + popup contact form. Built as small React
components, validated with **Zod**, bundled by **Vite** into one
self-contained `<script>` file that drops into WordPress, plain HTML,
Shopify — anywhere — with no build step or React dependency on the host
page.

## Project structure

```
src/
  components/
    ChatWidget.jsx      # top-level: positions root, renders bubble + panel
    ChatBubble.jsx       # the floating round button
    ChatPanel.jsx         # the popup window (header + body + footer)
    ChatHeader.jsx         # company name, tagline, logo, close button
    ChatForm.jsx             # form state, Zod validation, submit + metadata
    FieldRenderer.jsx         # renders one field by `type` (text/email/select/...)
    SuccessMessage.jsx         # post-submit confirmation view (checkmark + personalized message)
    TeaserBubble.jsx             # dismissable "Hi there! Have a question?" card shown before opening
    ChatFooter.jsx                 # "Powered by ..." line
    Icons.jsx                       # inline SVG icons
  lib/
    defaultConfig.js       # default config + mergeConfig()
    buildSchema.js           # field config -> Zod schema
    collectMetadata.js         # page URL, browser/OS, timezone (no network calls)
    widgetStyles.js               # CSS-in-JS string, scoped inside Shadow DOM
    mountWidget.js                  # Shadow DOM mount + window.kiyaanix_cwc_widget API
  embed.js                            # entry point for the distributable build
  dev-main.js                           # entry point for local dev playground
index.html                                # dev playground host page
```

Each component does one job, so extending the widget usually means
touching exactly one file:

| Want to...                          | Edit                                      |
|--------------------------------------|--------------------------------------------|
| Add a new field type (checkbox, file) | `FieldRenderer.jsx` + `lib/buildSchema.js` |
| Change validation rules              | `lib/buildSchema.js`                       |
| Change what metadata is captured     | `lib/collectMetadata.js`                   |
| Restyle                              | `lib/widgetStyles.js`                      |
| Change submit/success/error flow     | `ChatForm.jsx`                             |
| Edit the teaser card                 | `TeaserBubble.jsx`                         |
| Edit the post-submit message         | `SuccessMessage.jsx`                       |

## Development

```bash
npm install
npm run dev
```

Opens `index.html` at `http://localhost:5173` with full Vite HMR — edit any
component and see it update instantly. The dev page loads a sample
`kiyaanix_cwc_config` from `src/dev-main.js` and puts test buttons on the page
for the JS API (`kiyaanix_cwc_widget.open()`, etc).

## Building the distributable widget

```bash
npm run build:embed
```

Produces **`dist-embed/chat-widget.js`** — a single IIFE file (~540 KB,
~165 KB gzipped; includes React, ReactDOM, and Zod bundled in) that any
site can load with one `<script>` tag. This is the file you actually
deploy/host on a CDN.

Two separate Vite configs, for two separate jobs:

- **`vite.config.js`** — dev server only (`npm run dev`). Standard React
  app setup with HMR, used purely for iterating on components.
- **`vite.embed.config.js`** — production library build (`npm run
  build:embed`). Uses Vite's [library
  mode](https://vitejs.dev/guide/build.html#library-mode) with `formats:
  ["iife"]` so the output runs as a plain script with no module system
  required on the host page, and bundles all dependencies rather than
  externalizing them.

## Installing on a site

```html
<script>
  window.kiyaanix_cwc_config = {
    companyName: "Acme Inc",
    endpoint: "https://your-api.com/leads",
    fields: [
      { id: "name", type: "text", label: "Your name", required: true, minLength: 2 },
      { id: "email", type: "email", label: "Email", required: true },
      { id: "message", type: "textarea", label: "How can we help?", required: true, minLength: 5 },
    ],
  };
</script>
<script src="https://yourcdn.com/chat-widget.js"></script>
```

**WordPress:** paste into footer.php before `</body>`, or use an "Insert
Headers and Footers" plugin / Custom HTML block.
**Shopify:** paste into `theme.liquid` before `</body>`.

It renders inside a **Shadow DOM**, so host-page CSS can never leak in or
be leaked on, whatever theme/CMS it sits in.

## Validation (Zod)

Each field in `config.fields` is turned into a Zod schema at
`lib/buildSchema.js`. Supported `type`s: `text`, `textarea`, `email`,
`tel`, `number`, `select`. Per-field options:

```js
{
  id: "message",
  type: "textarea",
  label: "How can we help?",
  required: true,
  minLength: 5,        // text/textarea only
  maxLength: 500,       // text/textarea only
  pattern: "^[A-Za-z ]+$", // text/textarea only, custom regex
  patternMessage: "Letters only",
}
```

On submit, `ChatForm.jsx` runs `schema.safeParse(values)`. Failures are
mapped back onto each field (`fieldErrors[field.id]`) and shown inline —
nothing is sent over the network until validation passes.

To add a new field type, add matching cases in both `FieldRenderer.jsx`
(how it renders) and `buildSchema.js` (how it validates) — they're kept as
two small, parallel switch statements rather than one large file.

## Metadata collection (page URL, browser)

On every successful submit, `ChatForm.jsx` attaches a `meta` object to the
payload, built in `lib/collectMetadata.js`:

```js
payload.meta = {
  // Instant, free, no network call — parsed from navigator/window/document:
  pageUrl, pageTitle, referrer,
  browserName, browserVersion, os, deviceType, userAgent,
  language, timezone, screenWidth, screenHeight, submittedAt,
}
```

Turn it off entirely with:

```js
window.kiyaanix_cwc_config = {
  // ...
  metadata: {
    collectBasic: false,
  },
};
```

**No IP address or country lookup happens in the browser.** The widget
makes no third-party requests. Determine the visitor's IP (and, if you need
it, country) server-side at your `endpoint` from the incoming request.
The LeadPerch WordPress plugin does this: it uses `REMOTE_ADDR`
by default, trusts proxy headers only when the site owner says the site is
behind Cloudflare or a load balancer, and reads the country from the CDN's
country header when one is available.

## Teaser bubble

`TeaserBubble.jsx` renders the small dismissable "Hi there! Have a
question?" card that appears above the round button before the panel is
opened. It's controlled by `config.teaserMessage`:

```js
window.kiyaanix_cwc_config = {
  teaserMessage: "Hi there! Have a question? Leave your details and we'll get right back to you.",
  // teaserMessage: "" or null disables it entirely
};
```

It disappears (for the rest of that page session) as soon as the visitor
dismisses it with its own close (×) or clicks it/the bubble to open the
full panel. Restyle it in `lib/widgetStyles.js` under `.cw-teaser`.

## Personalized success message

`SuccessMessage.jsx` shows a checkmark icon, a bold heading, and a message
that can include `{name}` — which is always filled in from the value the
visitor actually typed into the form (looked up via `config.nameFieldId`
against the submitted, Zod-validated data), never a static placeholder:

```js
window.kiyaanix_cwc_config = {
  successHeading: "Message sent!",
  successMessage: "Thanks, {name}, we'll get right back to you.",
  nameFieldId: "name", // change if your name field's id differs, e.g. "fullName"
};
```

If the configured field is empty or missing, the `{name}` (and its leading
comma) are dropped automatically rather than showing "undefined" or a
blank gap.

## Sending to WordPress (with a nonce)

The widget already supports this with zero code changes — `config.headers`
and `config.extraPayload` are merged into every request, so a WordPress
nonce just rides along as a header or a body field. See `wordpress/` for
two complete, drop-in approaches:

**REST API (recommended)** — `wordpress/rest-endpoint.php` +
`wordpress/enqueue-widget.php`:
1. `rest-endpoint.php` registers `POST /wp-json/chat-widget/v1/submit` and
   verifies the nonce with `wp_verify_nonce( $nonce, 'wp_rest' )`, reading
   it from the `X-WP-Nonce` header.
2. `enqueue-widget.php` enqueues the widget script and uses
   `wp_add_inline_script(..., 'before')` to print
   `window.kiyaanix_cwc_config` — including a fresh `wp_create_nonce(
   'wp_rest' )` under `headers['X-WP-Nonce']` — before the widget's
   auto-init runs.
3. The server always re-derives the visitor's real IP from
   `$_SERVER['HTTP_X_FORWARDED_FOR']` / `REMOTE_ADDR`, rather than trusting
   the client-reported `meta.ip` (see the Metadata section above).

**admin-ajax.php (classic pattern)** — `wordpress/admin-ajax-endpoint.php`
+ `wordpress/enqueue-widget-ajax.php`: same idea, but the nonce travels as
a POST body field (`nonce`) verified with `check_ajax_referer(
'chat_widget_nonce', 'nonce', false )`, sent via `extraPayload` instead of
`headers`, since admin-ajax dispatches by an `action` field rather than a
URL path.

**Nonces expire** (WordPress REST nonces last one browser session, ~12–24h).
On a page left open a long time, a stale nonce causes a 403. The widget
already handles this: set `config.staleSessionMessage` (default: "Your
session expired — please refresh the page and try again.") to show a
distinct message instead of the generic `errorMessage` when a 403 comes
back — see `ChatForm.jsx`.

## Full config reference

```js
window.kiyaanix_cwc_config = {
  companyName: "Acme Inc",
  tagline: "Typically replies within a few hours",
  greeting: "Hi there! ...",
  // Dismissable card shown above the bubble before the panel is opened.
  // Set to "" or null to disable it.
  teaserMessage: "Hi there! Have a question? Leave your details and we'll get right back to you.",
  poweredByText: "Powered by Acme",
  poweredByUrl: "https://acme.com",
  logoUrl: "https://.../logo.png",
  bannerImageUrl: "https://.../header-bg.jpg",

  startOpen: false,
  position: "bottom-right", // or "bottom-left"
  offset: { x: 24, y: 24 },
  zIndex: 999999,

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
    fontFamily: "system-ui, sans-serif",
    buttonTextColor: "#ffffff",
  },

  fields: [
    { id: "name", type: "text", label: "Your name", required: true, minLength: 2 },
    { id: "email", type: "email", label: "Email", required: true },
    { id: "phone", type: "tel", label: "Phone" },
    { id: "topic", type: "select", label: "Topic", options: ["Sales", "Support"] },
    { id: "message", type: "textarea", label: "How can we help?", required: true, minLength: 5 },
  ],

  submitButtonText: "Send",
  // Shown after a successful submit, with a checkmark icon above them.
  // {name} in successMessage is replaced with the value the visitor typed
  // into whichever field's id matches nameFieldId (dropped cleanly if
  // that field was empty/absent) — it is always the visitor's own input,
  // never a placeholder or the company name.
  successHeading: "Message sent!",
  successMessage: "Thanks, {name}, we'll get right back to you.",
  nameFieldId: "name", // must match the id of your "name" field below
  errorMessage: "Something went wrong. Please try again.",

  endpoint: "https://your-api.com/leads",
  method: "POST",
  headers: { "Authorization": "Bearer xyz" },
  extraPayload: { source: "site-widget" },

  metadata: {
    collectBasic: true,
  },
};
```

## Programmatic API

```js
kiyaanix_cwc_widget.init(config);
kiyaanix_cwc_widget.configure(partialConfig); // merge changes at runtime
kiyaanix_cwc_widget.open();
kiyaanix_cwc_widget.close();
kiyaanix_cwc_widget.destroy();
kiyaanix_cwc_widget.getConfig();
```

Callbacks are set in JS (functions don't survive JSON), added on top of a
config passed to `init`/`configure`:

```js
kiyaanix_cwc_widget.configure({
  onOpen: () => {},
  onClose: () => {},
  onSubmit: (payload) => {},      // fires right before send, payload includes meta
  onSuccess: (response) => {},
  onError: (err) => {},
  transformPayload: (payload) => payload, // reshape before POSTing
});
```

## Notes on dependency versions

Pinned to **Vite 5** and **React 18** (stable, widely documented) rather
than the newest majors, since this is meant to be easy for you to keep
building on. `npm audit` will flag a moderate advisory in Vite's bundled
esbuild dev server (GHSA-67mh-4wv8-2f99) — it only affects the local dev
server's handling of cross-origin requests during `npm run dev`, not the
production `dist-embed/chat-widget.js` output, so it's safe to leave as-is
unless you want to track Vite's next minor for the fix.
## License

Copyright (C) 2026 Kiyaanix Team.

This widget is part of the [LeadPerch](https://kiyaanix.com)
WordPress plugin and is released under the **GNU General Public License
v2.0 or later** (GPL-2.0-or-later). See [LICENSE](LICENSE) for the full text.

The built bundle includes these third-party libraries, each under the MIT
license: [React and React DOM](https://github.com/facebook/react) and
[Zod](https://github.com/colinhacks/zod).
