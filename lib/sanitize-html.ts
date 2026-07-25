/**
 * Sanitize untrusted HTML before rendering with dangerouslySetInnerHTML.
 * Strips scripts, event handlers, and dangerous URL schemes.
 */

/** Synchronous sanitize for RSC and client renders. */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return "";

  let out = dirty;
  // Drop dangerous elements and their contents
  out = out.replace(
    /<\s*(script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
    "",
  );
  out = out.replace(
    /<\s*(script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select)[^>]*\/?\s*>/gi,
    "",
  );
  // Strip event handlers
  out = out.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // Neutralize javascript: / vbscript: / data: URLs
  out = out.replace(
    /\s(href|src|xlink:href)\s*=\s*(["'])\s*(javascript|vbscript|data):[^"']*\2/gi,
    " $1=$2#$2",
  );
  // Force safe rel on target=_blank
  out = out.replace(
    /(<a\b[^>]*\btarget\s*=\s*(["'])_blank\2[^>]*)(>)/gi,
    (_m, start: string, _q: string, end: string) => {
      if (/\brel\s*=/i.test(start)) return `${start}${end}`;
      return `${start} rel="noopener noreferrer"${end}`;
    },
  );
  return out;
}
