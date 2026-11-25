import { z } from "zod";

/**
 * Converts a data-driven field config array into a Zod object schema.
 * Add a new `type` case here whenever FieldRenderer grows a new type.
 *
 * field: { id, type, label, required, minLength, maxLength, pattern, options }
 */
export function buildSchemaFromFields(fields) {
  const shape = {};

  for (const field of fields) {
    shape[field.id] = fieldToZod(field);
  }

  return z.object(shape);
}

function fieldToZod(field) {
  let schema;

  switch (field.type) {
    case "email":
      schema = z.string().trim().email({ message: `Enter a valid email address` });
      break;

    case "tel":
      schema = z
        .string()
        .trim()
        .regex(/^[+\d][\d\s()-]{5,20}$/, { message: "Enter a valid phone number" });
      break;

    case "number":
      schema = z.coerce.number({ invalid_type_error: `${field.label} must be a number` });
      break;

    case "select":
      if (field.options && field.options.length) {
        const values = field.options.map((o) => (typeof o === "string" ? o : o.value));
        schema = z.enum(values, {
          errorMap: () => ({ message: `Choose an option for ${field.label}` }),
        });
      } else {
        schema = z.string();
      }
      break;

    case "textarea":
    case "text":
    default:
      schema = z.string().trim();
      if (field.minLength) {
        schema = schema.min(field.minLength, {
          message: `${field.label} must be at least ${field.minLength} characters`,
        });
      }
      if (field.maxLength) {
        schema = schema.max(field.maxLength, {
          message: `${field.label} must be under ${field.maxLength} characters`,
        });
      }
      if (field.pattern) {
        schema = schema.regex(new RegExp(field.pattern), {
          message: field.patternMessage || `${field.label} is invalid`,
        });
      }
      break;
  }

  // Optional fields: allow empty string, otherwise still validate when filled.
  if (!field.required) {
    if (field.type === "tel" || field.type === "email") {
      return z.union([z.literal(""), schema]).optional();
    }
    return schema.optional().or(z.literal(""));
  }

  // Required fields: non-empty check with a friendly message.
  if (schema instanceof z.ZodString) {
    schema = schema.min(1, { message: `${field.label} is required` });
  }

  return schema;
}
