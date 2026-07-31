import {
  assignmentDescriptionLooksLikeHtml,
} from "@/lib/assignments/parse-assignment-description";
import { ArticleHtml } from "@/components/ui/article-html";
import { cn } from "@/lib/utils";

export function AssignmentInstructionsBody({
  instructions,
  className,
}: {
  instructions: string;
  className?: string;
}) {
  if (!instructions.trim()) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No instructions provided.
      </p>
    );
  }

  if (assignmentDescriptionLooksLikeHtml(instructions)) {
    return (
      <ArticleHtml
        html={instructions}
        size="sm"
        className={cn(className)}
      />
    );
  }

  return (
    <p
      className={cn(
        "whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]",
        className,
      )}
    >
      {instructions}
    </p>
  );
}
