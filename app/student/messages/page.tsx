import { Inbox } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ThreadComposer } from "@/components/chat/thread-composer";
import { StudentSecondaryNav } from "@/components/student/student-secondary-nav";
import { UserRole } from "@/generated/prisma/enums";
import { listThreadsForUser, loadThreadForUser } from "@/lib/chat";
import { roleHomePath } from "@/lib/rbac";

type SearchParams = {
  thread?: string;
};

export default async function StudentMessagesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/student/login?callbackUrl=/student/messages");
  if (session.user.role !== UserRole.STUDENT)
    redirect(roleHomePath(session.user.role));

  const params = (await searchParams) ?? {};
  const threads = await listThreadsForUser(session.user.id);
  const activeThreadId = params.thread ?? threads[0]?.id ?? "";
  const active = activeThreadId
    ? await loadThreadForUser(activeThreadId, session.user.id)
    : null;

  return (
    <div className="space-y-6 text-[var(--foreground)]">
      <StudentSecondaryNav />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Messages
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Conversations with your mentors and admins. New messages appear here
          automatically.
        </p>
      </div>

      <div className="flex min-h-[480px] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] md:flex-row">
        <aside className="flex w-full flex-col border-b border-[var(--border)] bg-[var(--surface-muted)]/30 md:w-[300px] md:border-b-0 md:border-r">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--muted)]">
            <Inbox className="h-3.5 w-3.5" />
            Conversations · {threads.length}
          </div>
          {threads.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
              <Inbox
                className="h-9 w-9 text-[var(--border)]"
                strokeWidth={1.25}
              />
              <p className="mt-3 text-sm font-semibold">No messages yet</p>
              <p className="mt-2 max-w-[240px] text-xs text-[var(--muted)]">
                When a mentor or admin reaches out, the thread will show up
                here. You can also start one by booking a meeting from a mentor
                profile.
              </p>
            </div>
          ) : (
            <ul className="flex-1 divide-y divide-[var(--border)] overflow-y-auto">
              {threads.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/student/messages?thread=${t.id}`}
                    className={
                      t.id === activeThreadId
                        ? "block bg-[var(--primary-soft)]/40 px-3 py-3"
                        : "block px-3 py-3 hover:bg-[var(--surface-muted)]"
                    }
                  >
                    <p className="truncate text-sm font-semibold">
                      {t.other.fullName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                      {t.preview ?? "No messages yet."}
                    </p>
                    {t.lastMessageAt ? (
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                        {t.lastMessageAt.toLocaleString()}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="flex flex-1 flex-col bg-[var(--surface)]">
          {active ? (
            <>
              <header className="border-b border-[var(--border)] px-5 py-3">
                <p className="text-sm font-bold">{active.other.fullName}</p>
                <p className="text-xs text-[var(--muted)]">
                  {active.other.role.toLowerCase()} · {active.other.email}
                </p>
              </header>
              <ol className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {active.thread.messages.length === 0 ? (
                  <li className="py-12 text-center text-sm text-[var(--muted)]">
                    No messages yet — say hello.
                  </li>
                ) : (
                  active.thread.messages.map((m) => {
                    const mine = m.senderId === session.user.id;
                    return (
                      <li
                        key={m.id}
                        className={
                          mine ? "flex justify-end" : "flex justify-start"
                        }
                      >
                        <div
                          className={
                            mine
                              ? "max-w-[78%] rounded-2xl bg-[var(--primary)] px-3 py-2 text-sm text-[var(--primary-foreground)] shadow-sm"
                              : "max-w-[78%] rounded-2xl bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm"
                          }
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {m.body}
                          </p>
                          <p
                            className={
                              mine
                                ? "mt-1 text-[10px] uppercase tracking-wide text-white/70"
                                : "mt-1 text-[10px] uppercase tracking-wide text-[var(--muted)]"
                            }
                          >
                            {m.sender.fullName} · {m.createdAt.toLocaleString()}
                          </p>
                        </div>
                      </li>
                    );
                  })
                )}
              </ol>
              <ThreadComposer
                threadId={active.thread.id}
                placeholder="Reply…"
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-8 py-16 text-center text-sm text-[var(--muted)]">
              Select a conversation, or wait for a mentor to message you.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
