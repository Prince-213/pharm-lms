import {
  assignmentDescriptionLooksLikeHtml,
} from "@/lib/assignments/parse-assignment-description";
import { SafeHtml } from "@/components/ui/safe-html";
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
      <SafeHtml
        html={instructions}
        className={cn(
          "prose prose-sm max-w-none text-sm leading-relaxed text-[var(--foreground)]",
          "[&_a]:text-[var(--primary)] [&_p]:mb-3 [&_ul]:my-2 [&_ol]:my-2",
          className,
        )}
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
