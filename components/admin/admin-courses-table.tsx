"use client";

import { clsx } from "clsx";
import {
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  Loader2,
  Mail,
  MessagesSquare,
  MoreHorizontal,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { refreshPortalAfterMutation } from "@/lib/client/refresh-portal-data";
import {
  approveCourseAction,
  deleteCourseAction,
  rejectCourseAction,
} from "@/app/admin/course-approvals/actions";
import { AdminCourseStatusBadge } from "@/components/admin/admin-course-status-badge";
import { CourseStatus } from "@/generated/prisma/enums";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";

export type AdminCourseRow = {
  id: string;
  title: string;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
  priceMinorUnits: number | null;
  priceCurrency: string;
  lessonCount: number;
  enrollmentCount: number;
  mentorName: string;
  mentorEmail: string;
  rejectionReason: string | null;
};

type Filter = "all" | "queue" | "published" | "draft" | "rejected";
type SortKey =
  | "updatedAt"
  | "title"
  | "mentorName"
  | "lessonCount"
  | "enrollmentCount"
  | "status";
type SortDir = "asc" | "desc";

type PanelState =
  | null
  | { courseId: string; phase: "menu"; left: number; top: number }
  | { courseId: string; phase: "reject"; left: number; top: number }
  | { courseId: string; phase: "delete"; left: number; top: number };

const POPOVER_W = 300;
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const POPOVER_GAP = 8;

/** Anchor point above the button; dialog uses translateY(-100%) so the panel sits above the trigger. */
function placePopover(anchor: DOMRect) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const left = Math.min(
    vw - POPOVER_W - 8,
    Math.max(8, anchor.right - POPOVER_W),
  );
  const top = anchor.top - POPOVER_GAP;
  return { left, top };
}

const STATUS_WEIGHT: Record<CourseStatus, number> = {
  DRAFT: 1,
  SUBMITTED: 2,
  APPROVED: 3,
  PUBLISHED: 4,
  REJECTED: 5,
};

export function AdminCoursesTable({ courses }: { courses: AdminCourseRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [pageSize, setPageSize] = useState<number>(20);
  const [page, setPage] = useState(1);

  const [panel, setPanel] = useState<PanelState>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closePanel = useCallback(() => {
    setPanel(null);
    setRejectReason("");
    setDeleteConfirmTitle("");
  }, []);

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, closePanel]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset pagination when browse filters or sort change.
  useEffect(() => {
    setPage(1);
  }, [filter, search, sortKey, sortDir, pageSize]);

  function copyCourseId(courseId: string) {
    void navigator.clipboard.writeText(courseId).then(() => {
      setCopiedId(courseId);
      window.setTimeout(
        () => setCopiedId((id) => (id === courseId ? null : id)),
        2000,
      );
    });
  }

  function openMenu(courseId: string, anchor: HTMLElement) {
    const r = anchor.getBoundingClientRect();
    const { left, top } = placePopover(r);
    setPanel((prev) => {
      if (prev?.courseId === courseId && prev.phase === "menu") return null;
      return { courseId, phase: "menu", left, top };
    });
    setRejectReason("");
    setDeleteConfirmTitle("");
  }

  function openRejectFromMenu() {
    if (!panel || panel.phase !== "menu") return;
    setPanel({
      courseId: panel.courseId,
      phase: "reject",
      left: panel.left,
      top: panel.top,
    });
    setRejectReason("");
  }

  function openDeleteFromMenu() {
    if (!panel || panel.phase !== "menu") return;
    setPanel({
      courseId: panel.courseId,
      phase: "delete",
      left: panel.left,
      top: panel.top,
    });
    setDeleteConfirmTitle("");
  }

  function sortBy(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setSortDir(nextKey === "updatedAt" ? "desc" : "asc");
  }

  const queueCount = courses.filter(
    (c) => c.status === CourseStatus.SUBMITTED,
  ).length;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    const byFilter = courses.filter((c) => {
      if (filter === "queue") return c.status === CourseStatus.SUBMITTED;
      if (filter === "published") return c.status === CourseStatus.PUBLISHED;
      if (filter === "draft") return c.status === CourseStatus.DRAFT;
      if (filter === "rejected") return c.status === CourseStatus.REJECTED;
      return true;
    });

    const bySearch = term
      ? byFilter.filter((c) => {
          const haystack = [
            c.title,
            c.id,
            c.mentorName,
            c.mentorEmail,
            c.status,
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(term);
        })
      : byFilter;

    return [...bySearch].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "mentorName":
          cmp = a.mentorName.localeCompare(b.mentorName);
          break;
        case "lessonCount":
          cmp = a.lessonCount - b.lessonCount;
          break;
        case "enrollmentCount":
          cmp = a.enrollmentCount - b.enrollmentCount;
          break;
        case "status":
          cmp = STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status];
          break;
        default:
          cmp =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [courses, filter, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const activeCourse = panel
    ? (courses.find((c) => c.id === panel.courseId) ?? null)
    : null;

  function runApprove(courseId: string) {
    const toastId = toast.loading("Publishing course...");
    startTransition(async () => {
      const res = await approveCourseAction(courseId);
      if ("error" in res) {
        toast.error(res.error ?? "Failed to publish", { id: toastId });
      } else {
        toast.success("Course published successfully!", { id: toastId });
        closePanel();
        refreshPortalAfterMutation(router);
      }
    });
  }

  function runReject(courseId: string) {
    const toastId = toast.loading("Rejecting course...");
    startTransition(async () => {
      const res = await rejectCourseAction(courseId, rejectReason);
      if ("error" in res) {
        toast.error(res.error ?? "Failed to reject", { id: toastId });
      } else {
        toast.success("Course rejected with feedback.", { id: toastId });
        closePanel();
        refreshPortalAfterMutation(router);
      }
    });
  }

  function runDelete(courseId: string) {
    const toastId = toast.loading("Deleting course...");
    startTransition(async () => {
      const res = await deleteCourseAction(courseId);
      if ("error" in res) {
        toast.error(res.error ?? "Deletion failed", { id: toastId });
      } else {
        toast.success("Course deleted permanently.", { id: toastId });
        closePanel();
        refreshPortalAfterMutation(router);
      }
    });
  }

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    {
      id: "queue",
      label: `Review queue${queueCount ? ` (${queueCount})` : ""}`,
    },
    { id: "published", label: "Published" },
    { id: "draft", label: "Drafts" },
    { id: "rejected", label: "Rejected" },
  ];

  const popover =
    mounted && panel && activeCourse
      ? createPortal(
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-[85] cursor-default bg-black/10"
              onClick={closePanel}
            />
            <div
              role="dialog"
              aria-label="Course actions"
              className="fixed z-[90] w-[300px] max-h-[min(85vh,560px)] origin-bottom overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1.5 shadow-lg ring-1 ring-black/5"
              style={{
                left: panel.left,
                top: panel.top,
                width: POPOVER_W,
                transform: "translateY(-100%)",
              }}
            >
              {panel.phase === "menu" ? (
                <div className="px-1">
                  <p className="truncate px-2.5 pb-1.5 pt-0.5 text-xs font-semibold text-[var(--foreground)]">
                    {activeCourse.title}
                  </p>
                  <p className="border-b border-[var(--border)] px-2.5 pb-2 text-[10px] text-muted-foreground">
                    Choose an action
                  </p>
                  <div className="max-h-[min(70vh,460px)] overflow-y-auto py-1">
                    <Link
                      href={`/admin/courses/${activeCourse.id}/overview`}
                      onClick={closePanel}
                      className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
                    >
                      <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                      Catalog overview
                    </Link>
                    <Link
                      href={`/admin/courses/${activeCourse.id}/preview`}
                      onClick={closePanel}
                      className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
                    >
                      <MessagesSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                      Curriculum & forums
                    </Link>
                    <div className="my-1 border-t border-[var(--border)]" />

                    {activeCourse.status === CourseStatus.SUBMITTED ? (
                      <>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => {
                            if (
                              !confirm(
                                "Publish this course to the student catalog?",
                              )
                            )
                              return;
                            runApprove(activeCourse.id);
                          }}
                          className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium text-[var(--foreground)] hover:bg-[var(--primary-soft)] disabled:opacity-50"
                        >
                          {pending ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--primary)]" />
                          ) : (
                            <Check className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                          )}
                          Approve and publish
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={openRejectFromMenu}
                          className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium text-rose-800 hover:bg-rose-50 disabled:opacity-50"
                        >
                          <X className="h-4 w-4 shrink-0" />
                          Reject with feedback
                        </button>
                        <div className="my-1 border-t border-[var(--border)]" />
                      </>
                    ) : null}

                    <a
                      href={`mailto:${encodeURIComponent(activeCourse.mentorEmail)}?subject=${encodeURIComponent(`Course: ${activeCourse.title}`)}&body=${encodeURIComponent(`Course ID: ${activeCourse.id}\n\n`)}`}
                      onClick={closePanel}
                      className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
                    >
                      <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                      Email tutor
                    </a>

                    <button
                      type="button"
                      onClick={() => copyCourseId(activeCourse.id)}
                      className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
                    >
                      <Copy className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {copiedId === activeCourse.id
                        ? "Course ID copied"
                        : "Copy course ID"}
                    </button>

                    <div className="my-1 border-t border-[var(--border)]" />
                    <button
                      type="button"
                      onClick={openDeleteFromMenu}
                      className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium text-rose-800 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4 shrink-0" />
                      Delete course
                    </button>
                  </div>
                </div>
              ) : panel.phase === "reject" ? (
                <div className="px-3 py-2">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[var(--foreground)]">
                      Reject course
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setPanel((p) =>
                          p && p.courseId === activeCourse.id
                            ? {
                                courseId: p.courseId,
                                phase: "menu",
                                left: p.left,
                                top: p.top,
                              }
                            : p,
                        )
                      }
                      className="rounded p-1 text-muted-foreground hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                      aria-label="Back"
                    >
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    </button>
                  </div>
                  <p className="mb-2 line-clamp-2 text-[11px] text-muted-foreground">
                    {activeCourse.title}
                  </p>
                  <label className="block text-xs font-medium text-[var(--foreground)]">
                    Reason for tutor
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={4}
                      className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs"
                      placeholder="Minimum 8 characters"
                    />
                  </label>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-[var(--background)]"
                      onClick={closePanel}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={pending || rejectReason.trim().length < 8}
                      onClick={() => runReject(activeCourse.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                      {pending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                      Confirm reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-2">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-rose-800">
                      Delete course
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setPanel((p) =>
                          p && p.courseId === activeCourse.id
                            ? {
                                courseId: p.courseId,
                                phase: "menu",
                                left: p.left,
                                top: p.top,
                              }
                            : p,
                        )
                      }
                      className="rounded p-1 text-muted-foreground hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                      aria-label="Back"
                    >
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    This permanently deletes lessons, enrollments, assignments,
                    forum threads, meetings, and review history for this course.
                  </p>
                  <p className="mt-2 line-clamp-2 text-[11px] font-semibold text-[var(--foreground)]">
                    {activeCourse.title}
                  </p>

                  <label className="mt-3 block text-xs font-medium text-[var(--foreground)]">
                    Type the exact course title to confirm
                    <input
                      value={deleteConfirmTitle}
                      onChange={(e) => setDeleteConfirmTitle(e.target.value)}
                      className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs"
                      placeholder={activeCourse.title}
                    />
                  </label>

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-[var(--background)]"
                      onClick={closePanel}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={
                        pending ||
                        deleteConfirmTitle.trim() !== activeCourse.title
                      }
                      onClick={() => runDelete(activeCourse.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                      {pending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Delete permanently
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <div className="space-y-4">
      {popover}

      <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative sm:col-span-2 lg:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, tutor, email, status, or ID"
            className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-sm"
          />
        </label>

        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          Sort
          <select
            value={`${sortKey}:${sortDir}`}
            onChange={(e) => {
              const [k, d] = e.target.value.split(":") as [SortKey, SortDir];
              setSortKey(k);
              setSortDir(d);
            }}
            className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm text-[var(--foreground)]"
          >
            <option value="updatedAt:desc">Recently updated</option>
            <option value="updatedAt:asc">Oldest updated</option>
            <option value="title:asc">Title A-Z</option>
            <option value="title:desc">Title Z-A</option>
            <option value="mentorName:asc">Tutor A-Z</option>
            <option value="lessonCount:desc">Most lessons</option>
            <option value="enrollmentCount:desc">Most enrollments</option>
            <option value="status:asc">Status</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          Rows
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm text-[var(--foreground)]"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={clsx(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition ring-1",
              filter === f.id
                ? "bg-[var(--primary)] text-white ring-[var(--primary)]"
                : "bg-[var(--surface)] text-muted-foreground ring-[var(--border)] hover:text-[var(--foreground)]",
            )}
          >
            {f.label}
          </button>
        ))}

        <div className="ml-auto text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-[var(--foreground)]">
            {filtered.length}
          </span>{" "}
          matching records
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => sortBy("title")}
                  >
                    Course <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => sortBy("mentorName")}
                  >
                    Tutor <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => sortBy("status")}
                  >
                    Status <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => sortBy("lessonCount")}
                  >
                    Lessons <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => sortBy("enrollmentCount")}
                  >
                    Enrollments <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => sortBy("updatedAt")}
                  >
                    Updated <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="w-28 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    No courses match these filters.
                  </td>
                </tr>
              ) : (
                paged.map((c) => (
                  <tr key={c.id} className="align-top text-[var(--foreground)]">
                    <td className="px-4 py-3">
                      <p className="max-w-[260px] font-medium leading-snug">
                        {c.title}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        ID: {c.id}
                      </p>
                      {c.status === CourseStatus.REJECTED &&
                      c.rejectionReason ? (
                        <p className="mt-1 max-w-[300px] text-xs text-rose-700">
                          <span className="font-semibold">Reason: </span>
                          {c.rejectionReason}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.mentorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.mentorEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <AdminCourseStatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {c.lessonCount}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {c.enrollmentCount}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatMinorUnitsToCurrency(
                        c.priceMinorUnits,
                        c.priceCurrency,
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(c.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        aria-expanded={panel?.courseId === c.id}
                        aria-haspopup="dialog"
                        onClick={(e) => openMenu(c.id, e.currentTarget)}
                        className={clsx(
                          "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold shadow-sm transition",
                          panel?.courseId === c.id
                            ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-strong)]"
                            : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--background)]",
                        )}
                      >
                        <MoreHorizontal className="h-4 w-4" aria-hidden />
                        Actions
                        <ChevronDown
                          className="h-3.5 w-3.5 opacity-70"
                          aria-hidden
                        />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--background)] px-4 py-3 text-xs text-muted-foreground">
          <p>
            Page{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {safePage}
            </span>{" "}
            of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 font-medium text-[var(--foreground)] disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 font-medium text-[var(--foreground)] disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
