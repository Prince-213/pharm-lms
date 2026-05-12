import { Inbox, Megaphone } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ThreadComposer } from "@/components/chat/thread-composer";
import { UserRole } from "@/generated/prisma/enums";
import { listThreadsForUser, loadThreadForUser } from "@/lib/chat";
import { roleHomePath } from "@/lib/rbac";

type SearchParams = {
  thread?: string;
};

export default async function MentorCommunicationMessagesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/tutor/login");
  if (session.user.role !== UserRole.TUTOR) {
    redirect(roleHomePath(session.user.role));
  }

  const params = (await searchParams) ?? {};
  const threads = await listThreadsForUser(session.user.id);
  const activeThreadId = params.thread ?? threads[0]?.id ?? "";
  const active = activeThreadId
    ? await loadThreadForUser(activeThreadId, session.user.id)
    : null;

  return (
    <div className="flex h-full min-h-[560px] flex-col px-5 py-6 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Messages</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Reply to students or start a 1:1 thread. Use the announcements page
            to broadcast to a full course.
          </p>
        </div>
        <Link
          href="/tutor/communication/announcements"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--primary)] bg-white px-4 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--primary-soft)]"
        >
          <Megaphone className="h-4 w-4" />
          Announcements
        </Link>
      </div>

      <div className="flex min-h-[480px] flex-1 flex-col gap-0 overflow-hidden rounded border border-[var(--border)] md:flex-row">
        <aside className="flex w-full flex-col border-b border-[var(--border)] bg-[var(--surface-muted)] md:w-[300px] md:border-b-0 md:border-r">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--muted)]">
            <Inbox className="h-3.5 w-3.5" />
            Conversations · {threads.length}
          </div>
          {threads.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[var(--border)] bg-white">
                <Inbox className="h-7 w-7 text-[#c0c4cc]" strokeWidth={1.25} />
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                No conversations yet
              </p>
              <p className="mt-2 max-w-[240px] text-xs leading-relaxed text-[var(--muted)]">
                When students message you or you start a thread from the
                students roster, it will appear here.
              </p>
            </div>
          ) : (
            <ul className="flex-1 divide-y divide-[#ececec] overflow-y-auto">
              {threads.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/tutor/communication/messages?thread=${t.id}`}
                    className={
                      t.id === activeThreadId
                        ? "block bg-[var(--primary-soft)]/40 px-3 py-3"
                        : "block px-3 py-3 hover:bg-[var(--surface-muted)]"
                    }
                  >
                    <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                      {t.other.fullName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                      {t.preview ?? "No messages yet."}
                    </p>
                    {t.lastMessageAt ? (
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-[#b4b9bd]">
                        {t.lastMessageAt.toLocaleString()}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="flex flex-1 flex-col bg-white">
          {active ? (
            <>
              <header className="border-b border-[#ececec] px-5 py-3">
                <p className="text-sm font-bold text-[var(--foreground)]">
                  {active.other.fullName}
                </p>
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
                              ? "max-w-[78%] rounded-2xl bg-[var(--primary)] px-3 py-2 text-sm text-white shadow-sm"
                              : "max-w-[78%] rounded-2xl bg-[#f3f4f6] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm"
                          }
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {m.body}
                          </p>
                          <p
                            className={
                              mine
                                ? "mt-1 text-[10px] uppercase tracking-wide text-white/70"
                                : "mt-1 text-[10px] uppercase tracking-wide text-[#9aa0a6]"
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
              Select a conversation on the left, or use Announcements to
              broadcast to all enrolled students of a course.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
