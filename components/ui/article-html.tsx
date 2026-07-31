import { SafeHtml } from "@/components/ui/safe-html";
import { cn } from "@/lib/utils";

type ArticleHtmlProps = {
  html: string | null | undefined;
  className?: string;
  as?: "div" | "span" | "article" | "section";
  /** Smaller type for side panels / instructions. Default: base article size. */
  size?: "sm" | "base";
};

const proseBase =
  "prose prose-pharm max-w-none text-[var(--foreground)] " +
  "prose-headings:scroll-mt-20 prose-headings:font-semibold prose-headings:tracking-tight " +
  "prose-a:font-semibold prose-a:text-[var(--primary)] prose-a:no-underline hover:prose-a:underline " +
  "prose-strong:text-[var(--foreground)] " +
  "prose-li:my-1 prose-ul:my-4 prose-ol:my-4 " +
  "prose-p:leading-relaxed " +
  "[&_*]:max-w-none";

/**
 * Sanitized HTML with Tailwind Typography + PharmLMS brand prose tokens.
 * Prefer this over bare SafeHtml for lesson articles and rich body copy.
 */
export function ArticleHtml({
  html,
  className,
  as = "div",
  size = "base",
}: ArticleHtmlProps) {
  return (
    <SafeHtml
      html={html}
      as={as}
      className={cn(
        proseBase,
        size === "sm" ? "prose-sm" : "prose-base",
        className,
      )}
    />
  );
}
