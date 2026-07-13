import { Inbox } from "lucide-react";
import Link from "next/link";
import { AdminBroadcastForm } from "@/components/admin/admin-broadcast-form";
import type { AdminForumCourseOption } from "@/components/admin/admin-forum-join-form";
import { AdminForumJoinForm } from "@/components/admin/admin-forum-join-form";
import {
  AdminMessagesNav,
  type AdminMessagesTab,
} from "@/components/admin/admin-messages-nav";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { ThreadComposer } from "@/components/chat/thread-composer";
import { CourseStatus } from "@/generated/prisma/enums";
import { requireAdminSession } from "@/lib/admin-auth";
import { listThreadsForUser, loadThreadForUser } from "@/lib/chat";
import { db } from "@/lib/db";

type SearchParams = {
  thread?: string;
  tab?: string;
};

function parseTab(raw: string | undefined): AdminMessagesTab {
  if (raw === "broadcast") return "broadcast";
  if (raw === "forum") return "forum";
  return "inbox";
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const session = await requireAdminSession();

  const params = (await searchParams) ?? {};
  const tab = parseTab(params.tab);

  const [threads, forumCourses] = await Promise.all([
    listThreadsForUser(session.user.id),
    tab === "forum"
      ? db.course.findMany({
          where: { status: CourseStatus.PUBLISHED },
          orderBy: { title: "asc" },
          take: 400,
          select: {
            id: true,
            title: true,
            mentor: { select: { fullName: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  const activeThreadId =
    tab === "inbox" ? (params.thread ?? threads[0]?.id ?? "") : "";
  const active = activeThreadId
    ? await loadThreadForUser(activeThreadId, session.user.id)
    : null;

  const courseOptions: AdminForumCourseOption[] = forumCourses.map((c) => ({
    id: c.id,
    title: c.title,
    mentorName: c.mentor.fullName,
  }));

  return (
    <>
      <AdminPageHeader
        title="Messages"
        description="Inbox, platform-wide broadcasts, and posting to course forums."
      />

      <AdminMessagesNav tab={tab} />

      {tab === "broadcast" ? (
        <AdminBroadcastForm />
      ) : tab === "forum" ? (
        <AdminForumJoinForm courses={courseOptions} />
      ) : (
        <div className="grid min-h-[420px] gap-4 lg:grid-cols-12">
          <AdminPanel
            title={`Threads (${threads.length})`}
            description="Newest first"
            className="lg:col-span-4"
          >
            {threads.length === 0 ? (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-10 text-center text-sm text-muted-foreground">
                <Inbox
                  className="h-9 w-9 text-muted-foreground"
                  strokeWidth={1.25}
                />
                <p className="mt-3 font-semibold">No threads yet</p>
                <p className="mt-1 text-xs">
                  When users contact you, conversations appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {threads.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/admin/messages?thread=${t.id}`}
                      className={
                        t.id === activeThreadId
                          ? "block bg-[var(--primary-soft)]/40 px-3 py-3"
                          : "block px-3 py-3 hover:bg-[var(--background)]"
                      }
                    >
                      <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                        {t.other.fullName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {t.preview ?? "No messages yet."}
                      </p>
                      {t.lastMessageAt ? (
                        <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                          {t.lastMessageAt.toLocaleString()}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>
          <AdminPanel
            title="Conversation"
            description={active?.other.fullName ?? "Select a thread"}
            className="lg:col-span-8"
          >
            {active ? (
              <div className="flex flex-col">
                <ol className="max-h-[480px] space-y-3 overflow-y-auto pb-4">
                  {active.thread.messages.length === 0 ? (
                    <li className="py-12 text-center text-sm text-muted-foreground">
                      No messages yet.
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
                                : "max-w-[78%] rounded-2xl bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm"
                            }
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {m.body}
                            </p>
                            <p
                              className={
                                mine
                                  ? "mt-1 text-[10px] uppercase tracking-wide text-white/70"
                                  : "mt-1 text-[10px] uppercase tracking-wide text-muted-foreground"
                              }
                            >
                              {m.sender.fullName} ·{" "}
                              {m.createdAt.toLocaleString()}
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
              </div>
            ) : (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-10 text-center text-sm text-muted-foreground">
                Pick a thread on the left.
              </div>
            )}
          </AdminPanel>
        </div>
      )}
    </>
  );
}
