/**
 * Renders one field based on `type`. To add a new field type:
 *   1. Add a case here.
 *   2. Add a matching case in lib/buildSchema.js so it validates too.
 */
export function FieldRenderer({ field, value, error, onChange }) {
  const commonProps = {
    id: `cw-field-${field.id}`,
    name: field.id,
    placeholder: field.label,
    value: value ?? "",
    onChange: (e) => onChange(field.id, e.target.value),
    className: `cw-input${error ? " cw-input-error" : ""}`,
    "aria-invalid": !!error,
    "aria-describedby": error ? `cw-field-${field.id}-error` : undefined,
  };

  let control;
  switch (field.type) {
    case "textarea":
      control = <textarea {...commonProps} rows={field.rows || 3} />;
      break;

    case "select":
      control = (
        <select {...commonProps} className={`cw-input cw-select${error ? " cw-input-error" : ""}`}>
          <option value="" disabled>
            {field.label}
          </option>
          {(field.options || []).map((opt) => {
            const optValue = typeof opt === "string" ? opt : opt.value;
            const optLabel = typeof opt === "string" ? opt : opt.label;
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            );
          })}
        </select>
      );
      break;

    case "email":
    case "tel":
    case "number":
    case "text":
    default:
      control = <input type={field.type || "text"} {...commonProps} />;
  }

  return (
    <div className="cw-field">
      {control}
      {error ? (
        <div className="cw-field-error" id={`cw-field-${field.id}-error`}>
          {error}
        </div>
      ) : null}
    </div>
  );
}
