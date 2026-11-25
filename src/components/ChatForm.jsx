import { useState, useMemo, useCallback, useEffect } from "react";
import { FieldRenderer } from "./FieldRenderer.jsx";
import { buildSchemaFromFields } from "../lib/buildSchema.js";
import { collectBasicMetadata } from "../lib/collectMetadata.js";

export const STATUS = { IDLE: "idle", SUBMITTING: "submitting", SUCCESS: "success", ERROR: "error" };

// Fields commonly skipped once we know who the logged-in visitor is —
// server re-derives name/email from the session anyway (see WP
// REST_Controller::handle_submit), so hiding them here is a UX nicety,
// not the actual security boundary.
const AUTO_FILLED_FIELD_IDS = ["name", "email"];

function formatCooldown(seconds) {
  if (seconds >= 86400) return `${Math.ceil(seconds / 86400)} day(s)`;
  if (seconds >= 3600) return `${Math.ceil(seconds / 3600)} hour(s)`;
  if (seconds >= 60) return `${Math.ceil(seconds / 60)} minute(s)`;
  return `${seconds} second(s)`;
}

export function ChatForm({ config, initialCooldownSeconds = 0, onSuccess }) {
  const [values, setValues] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState(STATUS.IDLE);
  const [formError, setFormError] = useState("");
  const [cooldownRemaining, setCooldownRemaining] = useState(initialCooldownSeconds);
  // WordPress injects this data before the widget is initialized, so no
  // client-side login lookup or field flash is needed.
  const visitorContext = config.visitorContext || { logged_in: false };

  useEffect(() => {
    if (!cooldownRemaining) return undefined;
    const timer = window.setInterval(() => {
      setCooldownRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownRemaining]);

  // Fields to actually render: drop the auto-filled ones for logged-in users.
  const visibleFields = useMemo(() => {
    if (!visitorContext?.logged_in) return config.fields;
    return config.fields.filter((f) => !AUTO_FILLED_FIELD_IDS.includes(f.id));
  }, [config.fields, visitorContext]);

  const schema = useMemo(() => buildSchemaFromFields(visibleFields), [visibleFields]);

  const handleFieldChange = useCallback((id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    setFieldErrors((prev) => (prev[id] ? { ...prev, [id]: undefined } : prev));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError("");

      const result = schema.safeParse(values);
      if (!result.success) {
        const errors = {};
        for (const issue of result.error.issues) {
          errors[issue.path[0]] = issue.message;
        }
        setFieldErrors(errors);
        return;
      }
      setFieldErrors({});

      // Page/browser metadata only (instant, no network call). IP and
      // country are determined server-side from the request.
      const basicMeta = config.metadata.collectBasic ? collectBasicMetadata() : {};

      let payload = {
        ...config.extraPayload,
        ...result.data,
        meta: basicMeta,
      };
      if (typeof config.transformPayload === "function") {
        payload = config.transformPayload(payload);
      }

      if (config.onSubmit) config.onSubmit(payload);

      if (!config.endpoint) {
        // Demo mode: no backend configured yet.
        setStatus(STATUS.SUCCESS);
        onSuccess(result.data);
        if (config.onSuccess) config.onSuccess({ demo: true, payload });
        return;
      }

      setStatus(STATUS.SUBMITTING);
      try {
        const res = await fetch(config.endpoint, {
          method: config.method || "POST",
          headers: { "Content-Type": "application/json", ...config.headers },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
		  const errorData = await res.json().catch(() => ({}));
		  const retryAfter = Number(errorData?.data?.retry_after) || 0;
		  if (res.status === 429 && retryAfter > 0) {
			const error = new Error("Submission cooldown is active.");
			error.cooldownSeconds = retryAfter;
			throw error;
		  }
          // A 403 here commonly means an expired WordPress REST nonce
          // (wp_verify_nonce failure) rather than a real submission
          // problem — surface a distinct message so it's not confused
          // with a validation/server error.
          if (res.status === 403 && config.staleSessionMessage) {
            throw new Error(config.staleSessionMessage, { cause: "stale_nonce" });
          }
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = await res.json().catch(() => ({}));
        setStatus(STATUS.SUCCESS);
        onSuccess(result.data, data);
        if (config.onSuccess) config.onSuccess(data);
      } catch (err) {
        setStatus(STATUS.ERROR);
        if (err.cooldownSeconds) {
          setCooldownRemaining(err.cooldownSeconds);
          setFormError("");
        } else {
          setFormError(err.cause === "stale_nonce" ? err.message : config.errorMessage);
        }
        if (config.onError) config.onError(err);
      }
    },
    [config, values, schema, onSuccess]
  );

  return (
    <form className="cw-form" onSubmit={handleSubmit} noValidate>
      {visitorContext?.logged_in && (
        <div className="cw-logged-in-note">
          {/* e.g. "Sending as Jane Doe (jane@example.com)" */}
          {config.loggedInNoteTemplate
            ? config.loggedInNoteTemplate
                .replace("{name}", visitorContext.name || "")
                .replace("{email}", visitorContext.email || "")
            : null}
        </div>
      )}

      {visibleFields.map((field) => (
        <FieldRenderer
          key={field.id}
          field={field}
          value={values[field.id]}
          error={fieldErrors[field.id]}
          onChange={handleFieldChange}
        />
      ))}

      {/* Honeypot: visually hidden (not type="hidden" — some bots skip
          those specifically) rather than removed from the DOM, so it
          still gets filled by naive bots that auto-fill every input. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="cw-honeypot"
        aria-hidden="true"
        value={values._hp || ""}
        onChange={(e) => handleFieldChange("_hp", e.target.value)}
      />

      {formError && <div className="cw-error">{formError}</div>}

      {cooldownRemaining > 0 && (
        <div className="cw-error">Please wait {formatCooldown(cooldownRemaining)} before sending another message.</div>
      )}

      <button type="submit" className="cw-submit-btn" disabled={status === STATUS.SUBMITTING || cooldownRemaining > 0}>
        {status === STATUS.SUBMITTING ? "Sending…" : config.submitButtonText}
      </button>
    </form>
  );
}
