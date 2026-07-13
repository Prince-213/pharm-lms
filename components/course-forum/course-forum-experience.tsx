import { Award, MessageCircle } from "lucide-react";
import Link from "next/link";
import { createForumPostAction } from "@/app/student/course/[courseId]/forum/actions";
import { UserRole } from "@/generated/prisma/enums";

function rolePill(role: UserRole) {
  if (role === UserRole.MENTOR || role === UserRole.TUTOR) {
    return "bg-sky-50 text-sky-800 ring-sky-200";
  }
  if (role === UserRole.ADMIN) {
    return "bg-violet-50 text-violet-800 ring-violet-200";
  }
  return "bg-primary/10 text-primary ring-primary/20";
}

type ForumPost = {
  id: string;
  body: string;
  createdAt: Date;
  author: { id: string; fullName: string; role: UserRole };
};

export function CourseForumExperience({
  courseId,
  courseTitle,
  sessionUserId,
  posts,
  badgeCountByStudent,
  variant,
  backLink,
  embedded = false,
}: {
  courseId: string;
  courseTitle: string;
  sessionUserId: string;
  posts: ForumPost[];
  badgeCountByStudent: Map<string, number>;
  variant: "student" | "tutor";
  backLink?: { href: string; label: string };
  /** When true, omit page-level chrome for embedding in the course player. */
  embedded?: boolean;
}) {
  const eyebrow = "Course forum";
  const subtitle =
    variant === "student"
      ? "Ask questions, discuss lesson concepts, and share clarifications with your cohort and instructor."
      : "Read and reply to enrolled students. Posts appear in the course forum for learners too.";

  const postsAndComposer = (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
      <div className="max-h-[60vh] space-y-3 overflow-auto p-4 sm:p-5">
        {!posts.length ? (
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-8 text-center">
            <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
              No posts yet
            </p>
            <p className="text-xs text-muted-foreground">
              Start the discussion with your first message.
            </p>
          </div>
        ) : (
          posts.map((post) => {
            const mine = post.author.id === sessionUserId;
            const badges =
              post.author.role === UserRole.STUDENT
                ? (badgeCountByStudent.get(post.author.id) ?? 0)
                : 0;
            return (
              <div
                key={post.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl border px-4 py-3 shadow-sm ${
                    mine
                      ? "border-[var(--primary)]/25 bg-[var(--primary-soft)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--foreground)]">
                      {post.author.fullName}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${rolePill(post.author.role)}`}
                    >
                      {post.author.role}
                    </span>
                    {post.author.role === UserRole.STUDENT ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200">
                        <Award className="h-3 w-3" />
                        {badges}
                      </span>
                    ) : null}
                    <time className="ml-auto text-[10px] text-muted-foreground">
                      {post.createdAt.toLocaleString()}
                    </time>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
                    {post.body}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        action={async (formData) => {
          "use server";
          const text = String(formData.get("message") ?? "");
          await createForumPostAction(courseId, text);
        }}
        className="border-t border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"
      >
        <div className="flex items-end gap-3">
          <textarea
            name="message"
            rows={3}
            maxLength={2000}
            required
            placeholder={
              variant === "tutor"
                ? "Write a reply to the course forum…"
                : "Write your message to the forum…"
            }
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-strong)]"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );

  if (embedded) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-soft)]">
            {eyebrow}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {postsAndComposer}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {backLink ? (
        <Link
          href={backLink.href}
          className="inline-flex text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          ← {backLink.label}
        </Link>
      ) : null}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          {eyebrow}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-[var(--foreground)]">
          {courseTitle}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {postsAndComposer}
    </div>
  );
}
