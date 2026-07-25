import { Inbox, Megaphone } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { NewMessageDialog } from "@/components/chat/new-message-dialog";
import { ThreadComposer } from "@/components/chat/thread-composer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { UserRole } from "@/generated/prisma/enums";
import { listThreadsForUser, loadThreadForUser } from "@/lib/chat";
import { listTutorChatContacts } from "@/lib/chat-contacts";
import { roleHomePath } from "@/lib/rbac";
import { cn } from "@/lib/utils";

type SearchParams = {
  thread?: string;
  recipient?: string;
};

export default async function TutorCommunicationMessagesPage({
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
  const [threads, contacts] = await Promise.all([
    listThreadsForUser(session.user.id),
    listTutorChatContacts(session.user.id),
  ]);

  const recipientId = params.recipient?.trim() || "";
  const recipientContact = contacts.find((c) => c.id === recipientId) ?? null;

  const activeThreadId =
    params.thread ?? (recipientContact ? "" : threads[0]?.id ?? "");
  const active = activeThreadId
    ? await loadThreadForUser(activeThreadId, session.user.id)
    : null;

  return (
    <div className="flex h-full min-h-[560px] flex-col px-5 py-6 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Messages</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Reply to students or start a 1:1 thread. Use announcements to
            broadcast to a full course.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NewMessageDialog
            contacts={contacts}
            redirectBase="/tutor/communication/messages"
          />
          <Button variant="outline" asChild>
            <Link href="/tutor/communication/announcements">
              <Megaphone className="h-4 w-4" />
              Announcements
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex min-h-[480px] flex-1 flex-col overflow-hidden rounded-lg border border-border md:flex-row">
        <aside className="flex w-full flex-col border-b border-border bg-muted/30 md:w-[300px] md:border-b-0 md:border-r">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs font-semibold text-muted-foreground">
            <Inbox className="h-3.5 w-3.5" />
            Conversations · {threads.length}
          </div>
          {threads.length === 0 ? (
            <EmptyState
              icon={Inbox}
              className="m-4 border-0 bg-transparent py-12 shadow-none"
              title="No conversations yet"
              description={
                contacts.length > 0
                  ? "Use New message to reach an enrolled student, or post an announcement for a course."
                  : "When students enroll in your courses, you can message them here."
              }
            />
          ) : (
            <ul className="flex-1 divide-y divide-border overflow-y-auto">
              {threads.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/tutor/communication/messages?thread=${t.id}`}
                    className={cn(
                      "block px-3 py-3",
                      t.id === activeThreadId
                        ? "bg-primary/10"
                        : "hover:bg-muted/60",
                    )}
                  >
                    <p className="truncate text-sm font-semibold text-foreground">
                      {t.other.fullName}
                      {t.unread ? (
                        <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-primary align-middle" />
                      ) : null}
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
        </aside>

        <section className="flex flex-1 flex-col bg-card">
          {active ? (
            <>
              <header className="border-b border-border px-5 py-3">
                <p className="text-sm font-bold text-foreground">
                  {active.other.fullName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {active.other.role.toLowerCase()} · {active.other.email}
                </p>
              </header>
              <ol className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {active.thread.messages.length === 0 ? (
                  <li className="py-12 text-center text-sm text-muted-foreground">
                    No messages yet — say hello.
                  </li>
                ) : (
                  active.thread.messages.map((m) => {
                    const mine = m.senderId === session.user.id;
                    return (
                      <li
                        key={m.id}
                        className={mine ? "flex justify-end" : "flex justify-start"}
                      >
                        <div
                          className={cn(
                            "max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                            mine
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground",
                          )}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {m.body}
                          </p>
                          <p
                            className={cn(
                              "mt-1 text-[10px] uppercase tracking-wide",
                              mine
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground",
                            )}
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
          ) : recipientContact ? (
            <>
              <header className="border-b border-border px-5 py-3">
                <p className="text-sm font-bold">{recipientContact.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {recipientContact.subtitle ?? "New conversation"}
                </p>
              </header>
              <div className="flex flex-1 items-center justify-center px-8 py-8 text-center text-sm text-muted-foreground">
                Write your first message below to start this conversation.
              </div>
              <ThreadComposer
                recipientId={recipientContact.id}
                placeholder={`Message ${recipientContact.fullName}…`}
                redirectBase="/tutor/communication/messages"
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-8 py-16 text-center text-sm text-muted-foreground">
              Select a conversation on the left, start with New message, or use
              Announcements to broadcast to a course.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
