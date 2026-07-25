import { sanitizeHtml } from "@/lib/sanitize-html";
import { cn } from "@/lib/utils";

type SafeHtmlProps = {
  html: string | null | undefined;
  className?: string;
  as?: "div" | "span" | "article" | "section";
};

/** Renders sanitized HTML. Use instead of raw dangerouslySetInnerHTML. */
export function SafeHtml({ html, className, as: Tag = "div" }: SafeHtmlProps) {
  const clean = sanitizeHtml(html);
  if (!clean) return null;
  return (
    <Tag
      className={cn(className)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Content passed through sanitizeHtml().
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
