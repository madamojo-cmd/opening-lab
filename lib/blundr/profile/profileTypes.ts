export type BlundrProfilePublic = {
  username: string | null;
};

export type BlundrUsernameValidation =
  | { ok: true; username: string; normalizedUsername: string }
  | {
      ok: false;
      code: "invalid_username" | "reserved_username";
      message: string;
    };

const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "support",
  "security",
  "system",
  "root",
  "staff",
  "moderator",
  "api",
  "auth",
  "blundr",
  "null",
  "undefined",
  "deleted",
]);

export function validateBlundrUsername(
  value: unknown,
): BlundrUsernameValidation {
  const username = String(value ?? "").trim();
  const normalizedUsername = username.toLowerCase();
  if (!/^[A-Za-z][a-z0-9_]{2,23}$/.test(username)) {
    return {
      ok: false,
      code: "invalid_username",
      message:
        "Use 3–24 characters: a letter first, then lowercase letters, numbers, or underscores.",
    };
  }
  if (RESERVED_USERNAMES.has(normalizedUsername)) {
    return {
      ok: false,
      code: "reserved_username",
      message: "That username is reserved. Choose another one.",
    };
  }
  return { ok: true, username, normalizedUsername };
}
