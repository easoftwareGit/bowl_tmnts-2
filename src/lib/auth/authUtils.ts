// small, pure helpers shared by the login/register forms and the API routes.
// No React or Next.js imports, so they work on the client and the server.

/** where to go after login when there is no (safe) callbackUrl */
export const defaultCallbackUrl = "/user/tmnts";

/** wrong passwords allowed before the account is locked */
export const maxPwdAttempts = 5;

/** how long a locked account stays locked */
export const pwdLockMinutes = 15;

/**
 * the error code login sends to the browser when the account is locked.
 * Shared by auth.ts (sends it) and the login form (shows the message).
 */
export const accountLockedCode = "account_locked";

/**
 * normalizes an email for saving, searching and logging in.
 * Emails are saved in lower case, so "Adam@Email.com" and "adam@email.com"
 * are the same account.
 *
 * @param email - email as typed or sent
 * @returns - trimmed, lower case email
 */
export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();

/**
 * turns the callbackUrl search param into a path on THIS site.
 * Anything that could send the user to another site goes to the default.
 *
 * @param raw - callbackUrl from the query string
 * @returns - a path that starts with a single "/"
 */
export const getSafeCallbackUrl = (raw: string | null | undefined): string => {
  if (!raw) return defaultCallbackUrl;

  let path = raw.trim();

  // absolute URL (e.g. from NextAuth or middleware): keep only the
  // path + search + hash, so the origin is always this site
  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      path = `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return defaultCallbackUrl;
    }
  }

  // must be a same-site path. "//evil.com" and "/\evil.com" are read by
  // browsers as another site, and "javascript:..." is not a path at all
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return defaultCallbackUrl;
  }

  // "/" (or an origin with no path) means "no preference"
  if (path === "/") return defaultCallbackUrl;

  return path;
};