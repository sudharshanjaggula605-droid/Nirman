/**
 * NIRMAN Centralized Production-Ready Error Sanitization
 * 
 * Ensures technical infrastructure details, database schemas, .env names,
 * API tokens, and internal exceptions are NEVER shown to end users.
 * All technical logs are captured cleanly in developer console / server logs.
 */

export function sanitizeUserFacingError(
  error: any,
  fallbackMessage = "Something went wrong. Please try again later."
): string {
  if (!error) return fallbackMessage;

  const rawMessage: string =
    typeof error === "string"
      ? error
      : error.message || error.error_description || error.details || "";

  // Always log technical error details to server/developer console for debugging
  console.error("[NIRMAN TECHNICAL ERROR LOG]", {
    timestamp: new Date().toISOString(),
    rawMessage,
    errorDetails: typeof error === "object" ? error : undefined,
  });

  const lower = rawMessage.toLowerCase();

  // 1. Specific User-Actionable Authentication & Validation Messages
  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
    return "Invalid email or password. Please verify your credentials and try again.";
  }

  if (
    lower.includes("user already registered") ||
    lower.includes("already exists") ||
    lower.includes("duplicate key") ||
    lower.includes("unique constraint")
  ) {
    return "An account with this email address or phone number already exists. Please sign in instead.";
  }

  if (lower.includes("password should be at least") || lower.includes("password is too short")) {
    return "Password must be at least 6 characters long.";
  }

  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Too many attempts. Please wait a few moments and try again.";
  }

  if (lower.includes("email not confirmed") || lower.includes("not confirmed")) {
    return "Your email address has not been verified yet. Please check your inbox.";
  }

  if (lower.includes("account pending") || lower.includes("pending approval")) {
    return "Your account is currently undergoing verification. Please check back shortly.";
  }

  if (lower.includes("account blocked") || lower.includes("blocked") || lower.includes("suspended")) {
    return "This account is currently suspended. Please contact NIRMAN support for help.";
  }

  // 2. Connectivity, Network, or Server Timeout Issues
  if (
    lower.includes("fetch failed") ||
    lower.includes("enotfound") ||
    lower.includes("econnrefused") ||
    lower.includes("etimedout") ||
    lower.includes("timeout") ||
    lower.includes("network error") ||
    lower.includes("failed to fetch") ||
    lower.includes("supabase") ||
    lower.includes("aborted") ||
    lower.includes("econnreset")
  ) {
    return "Unable to reach the server. Please check your internet connection and try again.";
  }

  // 3. Technical Database, Configuration, or Internal Infrastructure Details
  const technicalKeywords = [
    "pgrst",
    "postgres",
    "supabase",
    "schema",
    "column",
    "table",
    "relation",
    "foreign key",
    "violates",
    "constraint",
    "jwt",
    "token",
    "bearer",
    ".env",
    "apikey",
    "syntax error",
    "null value",
    "stack trace",
    "internal server error",
    "500",
    "502",
    "503",
    "504",
  ];

  const containsTechnicalDetails = technicalKeywords.some((keyword) =>
    lower.includes(keyword)
  );

  if (containsTechnicalDetails) {
    return fallbackMessage;
  }

  // 4. Clean custom user-facing validation strings (short, clean, no code or paths)
  if (
    rawMessage.length > 0 &&
    rawMessage.length < 100 &&
    !rawMessage.includes("{") &&
    !rawMessage.includes("}") &&
    !rawMessage.includes(";") &&
    !rawMessage.includes("\\") &&
    !rawMessage.includes("at ")
  ) {
    return rawMessage;
  }

  return fallbackMessage;
}
