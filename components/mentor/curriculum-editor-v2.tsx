"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Check,
  ExternalLink,
  FileText,
  GripVertical,
  Link2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  FileVideo,
} from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCourseStudio } from "@/components/mentor/course-studio-context";
import { RichTextArea } from "@/components/rich-text-area";
import { CurriculumFormPanel } from "@/components/mentor/curriculum-form-panel";
import { FileUploader } from "@/components/upload/file-uploader";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { parseSectionDescription as parseDescription } from "@/lib/curriculum";

// ── Types ────────────────────────────────────────────────────────────────────

type Lesson = {
  id: string;
  title: string;
  videoUrl: string | null;
  content: string | null;
};

type SectionQuiz = { id: string; title: string };
type SectionAssignment = {
  id: string;
  title: string;
  status: string;
  description?: string | null;
  dueDate?: string | null;
};

export type SectionResource = {
  id: string;
  type: "LINK" | "FILE";
  title: string;
  url: string;
  /** Set when type is FILE from tutor upload (stored in section description JSON). */
  originalFileName?: string;
  sizeBytes?: number;
  mimeType?: string;
};

type Section = {
  id: string;
  title: string;
  description: string | null;
  lessons: Lesson[];
  quizzes: SectionQuiz[];
  assignmentItems: SectionAssignment[];
  resources: SectionResource[];
};

type McqFormRow = {
  id: string;
  prompt: string;
  correctAnswer: string;
  wrong1: string;
  wrong2: string;
  wrong3: string;
};

function createEmptyMcqRow(): McqFormRow {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `row-${Date.now()}-${Math.random()}`,
    prompt: "",
    correctAnswer: "",
    wrong1: "",
    wrong2: "",
    wrong3: "",
  };
}

function mcqRowsValid(rows: McqFormRow[]): boolean {
  if (rows.length === 0) return false;
  for (const r of rows) {
    const p = r.prompt.trim();
    const c = r.correctAnswer.trim();
    const w = [r.wrong1.trim(), r.wrong2.trim(), r.wrong3.trim()];
    if (!p || !c || w.some((x) => !x)) return false;
    const all = [c, ...w];
    if (new Set(all.map((x) => x.toLowerCase())).size !== 4) return false;
  }
  return true;
}

function mcqRowsToPayload(rows: McqFormRow[]) {
  return rows.map((r) => ({
    kind: "multiple_choice" as const,
    prompt: r.prompt.trim(),
    correctAnswer: r.correctAnswer.trim(),
    incorrectOptions: [
      r.wrong1.trim(),
      r.wrong2.trim(),
      r.wrong3.trim(),
    ] as [string, string, string],
  }));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * We piggyback resources onto the existing `description` JSON field.
 * Format: { text?: string; resources?: SectionResource[] }
 * This avoids a DB migration entirely.
 */
// Removed redundant local parseDescription

function encodeDescription(text: string, resources: SectionResource[]): string {
  if (!text && resources.length === 0) return "";
  return JSON.stringify({ text, resources });
}

function patchSectionDescription(
  sections: Section[],
  sectionId: string,
  resources: SectionResource[],
): Section[] {
  return sections.map((s) => {
    if (s.id !== sectionId) return s;
    return { ...s, resources };
  });
}

type CurriculumPanel =
  | { kind: "lesson"; sectionId: string }
  | { kind: "item"; sectionId: string }
  | { kind: "resource"; sectionId: string };

const fieldClass =
  "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/15 disabled:bg-[var(--surface-muted)] disabled:opacity-70";

// ── Main Component ────────────────────────────────────────────────────────────

export function CurriculumEditorV2({ courseId }: { courseId: string }) {
  const { readOnly } = useCourseStudio();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingOps, setPendingOps] = useState(0);
  const saving = pendingOps > 0;
  const interactionLocked = readOnly || saving;

  // ── Section form ──────────────────────────────────────────────────────────
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionObjective, setNewSectionObjective] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");

  const [activePanel, setActivePanel] = useState<CurriculumPanel | null>(null);

  // ── Lesson form ───────────────────────────────────────────────────────────
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonType, setNewLessonType] = useState<"VIDEO" | "ARTICLE">("VIDEO");
  const [newLessonArticleContent, setNewLessonArticleContent] = useState("");
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState<string | null>(null);

  // ── Curriculum item form ──────────────────────────────────────────────────
  const [itemType, setItemType] = useState<"QUIZ" | "ASSIGNMENT">("QUIZ");
  const [itemTitle, setItemTitle] = useState("");
  const [quizMcqRows, setQuizMcqRows] = useState<McqFormRow[]>(() => [
    createEmptyMcqRow(),
  ]);
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentDueDays, setAssignmentDueDays] = useState("7");

  // ── Resource form ─────────────────────────────────────────────────────────
  const [resourceType, setResourceType] = useState<"LINK" | "FILE">("LINK");
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceFileUrl, setResourceFileUrl] = useState<string | null>(null);
  const [resourceFileMeta, setResourceFileMeta] = useState<{
    name: string;
    sizeBytes: number;
    mimeType?: string;
  } | null>(null);
  const [resourceUploading, setResourceUploading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // ─────────────────────────────────────────────────────────────────────────

  const canAddSection = useMemo(() => newSectionTitle.trim().length >= 3, [newSectionTitle]);
  const canAddItem = useMemo(() => {
    if (itemTitle.trim().length < 2) return false;
    if (itemType === "QUIZ") return mcqRowsValid(quizMcqRows);
    return true;
  }, [itemTitle, itemType, quizMcqRows]);
  const canAddResource = useMemo(
    () =>
      resourceTitle.trim().length >= 2 &&
      (resourceType === "FILE"
        ? Boolean(resourceFileUrl)
        : resourceUrl.trim().length >= 4),
    [resourceTitle, resourceType, resourceFileUrl, resourceUrl],
  );

  const canAddNewLesson = useMemo(() => {
    if (newLessonType === "ARTICLE") {
      return newLessonArticleContent.replace(/<[^>]+>/g, " ").trim().length > 0;
    }
    return Boolean(newLessonVideoUrl);
  }, [newLessonType, newLessonArticleContent, newLessonVideoUrl]);

  function openPanel(panel: CurriculumPanel) {
    setExpandedSections((prev) => new Set([...prev, panel.sectionId]));
    setActivePanel(panel);
  }

  function closePanel() {
    setActivePanel(null);
    setNewLessonTitle("");
    setNewLessonType("VIDEO");
    setNewLessonArticleContent("");
    setNewLessonVideoUrl(null);
    setItemTitle("");
    setItemType("QUIZ");
    setQuizMcqRows([createEmptyMcqRow()]);
    setAssignmentDescription("");
    setAssignmentDueDays("7");
    setResourceType("LINK");
    setResourceTitle("");
    setResourceUrl("");
    setResourceFileUrl(null);
    setResourceFileMeta(null);
  }

  function panelOpenFor(sectionId: string, kind: CurriculumPanel["kind"]) {
    return activePanel?.kind === kind && activePanel.sectionId === sectionId;
  }

  const lessonUpdateDebounce = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

  function suggestContentType(title: string): "VIDEO" | "ARTICLE" {
    const l = title.toLowerCase();
    if (l.includes("intro") || l.includes("demo") || l.includes("lab") || l.includes("practical") || l.includes("procedure"))
      return "VIDEO";
    return "ARTICLE";
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  const loadCurriculum = useCallback(async () => {
    const res = await fetch(`/api/tutor/courses/${courseId}/curriculum`, { method: "GET", cache: "no-store" });
    if (!res.ok) {
      const j = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(j?.error ?? "Unable to load curriculum.");
      return;
    }
    const data = (await res.json()) as { sections: (Omit<Section, "resources"> & { description: string | null })[] };
    setSections(
      data.sections.map((s) => ({
        ...s,
        resources: parseDescription(s.description).resources,
      })),
    );
    // Expand the first section by default if any
    if (data.sections.length > 0) {
      setExpandedSections(new Set([data.sections[0].id]));
    }
  }, [courseId]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadCurriculum();
      setLoading(false);
    })();
  }, [loadCurriculum]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  async function runPending<T>(action: () => Promise<T>) {
    setPendingOps((v) => v + 1);
    try {
      return await action();
    } finally {
      setPendingOps((v) => v - 1);
    }
  }

  async function pushResources(sectionId: string, resources: SectionResource[]) {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return Promise.reject(new Error("Section not found"));
    const { text } = parseDescription(section.description);
    const encodedDesc = encodeDescription(text, resources);
    return runPending(async () => {
      const res = await fetch(`/api/tutor/courses/${courseId}/sections/${sectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: section.title, description: encodedDesc }),
      });
      if (!res.ok) throw new Error("Failed to sync resources");
      return res;
    });
  }

  async function uploadVideoAsset(file: File) {
    if (readOnly || saving) return null;
    const formData = new FormData();
    formData.set("file", file);
    formData.set("purpose", "lesson-video");
    const res = await runPending(() =>
      fetch(`/api/tutor/courses/${courseId}/upload`, { method: "POST", body: formData }),
    );
    if (!res.ok) return null;
    return (await res.json()) as { url: string };
  }

  // ── CRUD Sections ─────────────────────────────────────────────────────────

  async function createSection() {
    if (readOnly || saving) return;
    const tempId = crypto.randomUUID();
    const newSection: Section = {
      id: tempId,
      title: newSectionTitle.trim(),
      description: null,
      lessons: [],
      quizzes: [],
      assignmentItems: [],
      resources: [],
    };
    
    // Optimistic UI update
    setSections((prev) => [...prev, newSection]);
    setNewSectionTitle("");
    setNewSectionObjective("");

    const res = await runPending(() =>
      fetch(`/api/tutor/courses/${courseId}/curriculum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSection.title, objective: newSectionObjective.trim() }),
      }),
    );

    if (!res.ok) {
      toast.error("Failed to create section.");
      setSections((prev) => prev.filter((s) => s.id !== tempId));
      return;
    }

    const realSection = (await res.json()) as Omit<Section, "resources">;
    setSections((prev) => prev.map((s) => (s.id === tempId ? { ...realSection, lessons: [], quizzes: [], assignmentItems: [], resources: [] } : s)));
    toast.success("Section created.");
  }

  async function renameSection(sectionId: string, title: string) {
    if (readOnly || saving) return;
    const prevSections = [...sections];
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, title: title.trim() } : s)));
    setEditingSectionId(null);
    setEditingSectionTitle("");

    const res = await runPending(() =>
      fetch(`/api/tutor/courses/${courseId}/sections/${sectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      }),
    );
    if (!res.ok) {
      toast.error("Failed to rename section.");
      setSections(prevSections);
    } else {
      toast.success("Section renamed.");
    }
  }

  async function deleteSection(sectionId: string) {
    if (readOnly || saving) return;
    const prevSections = [...sections];
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    
    const res = await runPending(() =>
      fetch(`/api/tutor/courses/${courseId}/sections/${sectionId}`, { method: "DELETE" }),
    );
    if (!res.ok) {
      toast.error("Failed to delete section.");
      setSections(prevSections);
    } else {
      toast.success("Section deleted.");
    }
  }

  // ── CRUD Lessons ──────────────────────────────────────────────────────────

  async function addLessonWithContent(sectionId: string) {
    if (readOnly || saving) return;

    const plain = newLessonArticleContent.replace(/<[^>]+>/g, " ").trim();
    if (!plain) return;

    const tempId = crypto.randomUUID();
    const value = newLessonArticleContent;

    await runPending(async () => {
      const tempLesson: Lesson = {
        id: tempId,
        title: newLessonTitle.trim() || "New lecture",
        videoUrl: null,
        content: value,
      };
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? { ...s, lessons: [...s.lessons, tempLesson] } : s,
        ),
      );
      closePanel();

      const res = await fetch(
        `/api/tutor/courses/${courseId}/sections/${sectionId}/lessons`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: tempLesson.title,
            contentType: "ARTICLE",
            value,
          }),
        },
      );

      if (!res.ok) {
        toast.error("Failed to create lesson.");
        setSections((prev) =>
          prev.map((s) =>
            s.id === sectionId
              ? { ...s, lessons: s.lessons.filter((l) => l.id !== tempId) }
              : s,
          ),
        );
        return;
      }

      const realLesson = (await res.json()) as Lesson;
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, lessons: s.lessons.map((l) => (l.id === tempId ? realLesson : l)) }
            : s,
        ),
      );
      toast.success("Lesson created.");
    });
  }

  async function addLessonWithVideo(sectionId: string, videoUrl: string) {
    if (readOnly || saving) return;

    const tempId = crypto.randomUUID();

    await runPending(async () => {
      const tempLesson: Lesson = {
        id: tempId,
        title: newLessonTitle.trim() || "New lecture",
        videoUrl: videoUrl,
        content: null,
      };
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? { ...s, lessons: [...s.lessons, tempLesson] } : s,
        ),
      );
      closePanel();
      setNewLessonVideoUrl(null);

      const res = await fetch(
        `/api/tutor/courses/${courseId}/sections/${sectionId}/lessons`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: tempLesson.title,
            contentType: "VIDEO",
            value: videoUrl,
          }),
        },
      );

      if (!res.ok) {
        toast.error("Failed to create lesson.");
        setSections((prev) =>
          prev.map((s) =>
            s.id === sectionId
              ? { ...s, lessons: s.lessons.filter((l) => l.id !== tempId) }
              : s,
          ),
        );
        return;
      }

      const realLesson = (await res.json()) as Lesson;
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, lessons: s.lessons.map((l) => (l.id === tempId ? realLesson : l)) }
            : s,
        ),
      );
      toast.success("Lesson created.");
    });
  }

  async function deleteLesson(sectionId: string, lessonId: string) {
    if (readOnly || saving) return;
    if (!window.confirm("Delete this lesson?")) return;

    const prevSections = [...sections];
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) }
          : s,
      ),
    );

    const res = await runPending(() =>
      fetch(`/api/tutor/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`, {
        method: "DELETE",
      }),
    );

    if (!res.ok) {
      toast.error("Failed to delete lesson.");
      setSections(prevSections);
    } else {
      toast.success("Lesson deleted.");
    }
  }

  function toggleSection(id: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function queueLessonPatch(sectionId: string, lessonId: string, payload: { title?: string; contentType?: "VIDEO" | "ARTICLE"; value?: string }) {
    if (readOnly) return;
    const key = `${sectionId}:${lessonId}`;
    const existing = lessonUpdateDebounce.current.get(key);
    if (existing) clearTimeout(existing);
    const timeout = setTimeout(() => {
      if (readOnly) return;
      void runPending(async () => {
        const res = await fetch(`/api/tutor/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) toast.error("Failed to save lesson update.");
      });
      lessonUpdateDebounce.current.delete(key);
    }, 350);
    lessonUpdateDebounce.current.set(key, timeout);
  }

  // ── CRUD Items (Quiz / Assignment) ────────────────────────────────────────

  async function addItem(sectionId: string) {
    if (readOnly || saving) return;
    const submittedType = itemType;
    if (submittedType === "QUIZ" && !mcqRowsValid(quizMcqRows)) {
      toast.error(
        "Each question needs a prompt, correct answer, three distractors, and four distinct options.",
      );
      return;
    }
    const quizQuestions =
      submittedType === "QUIZ" ? mcqRowsToPayload(quizMcqRows) : undefined;
    const tempId = crypto.randomUUID();

    // Optimistic UI
    const tempItem = {
      id: tempId,
      title: itemTitle.trim(),
      status: "DRAFT",
    };

    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        if (submittedType === "QUIZ") return { ...s, quizzes: [...s.quizzes, { id: tempId, title: tempItem.title }] };
        return { ...s, assignmentItems: [...s.assignmentItems, tempItem as SectionAssignment] };
      })
    );

    setItemTitle("");
    setItemType("QUIZ");
    setQuizMcqRows([createEmptyMcqRow()]);
    setAssignmentDescription("");
    setAssignmentDueDays("7");
    closePanel();

    const res = await runPending(() =>
      fetch(`/api/tutor/courses/${courseId}/sections/${sectionId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: submittedType,
          title: tempItem.title,
          quizQuestions: submittedType === "QUIZ" ? quizQuestions : undefined,
          assignmentDescription: submittedType === "ASSIGNMENT" ? assignmentDescription : undefined,
          dueDays: submittedType === "ASSIGNMENT" ? Number(assignmentDueDays || "7") : undefined,
        }),
      }),
    );
    if (!res.ok) {
      toast.error("Could not add curriculum item.");
      // Rollback
      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== sectionId) return s;
          if (submittedType === "QUIZ") return { ...s, quizzes: s.quizzes.filter(q => q.id !== tempId) };
          return { ...s, assignmentItems: s.assignmentItems.filter(a => a.id !== tempId) };
        })
      );
      return;
    }
    const created = (await res.json()) as { itemType: "QUIZ" | "ASSIGNMENT"; item: SectionQuiz | SectionAssignment };
    
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        if (created.itemType === "QUIZ") {
          return { ...s, quizzes: s.quizzes.map(q => q.id === tempId ? created.item as SectionQuiz : q) };
        }
        return { ...s, assignmentItems: s.assignmentItems.map(a => a.id === tempId ? created.item as SectionAssignment : a) };
      }),
    );
    toast.success(created.itemType === "QUIZ" ? "Quiz added to section." : "Assignment added to section.");
  }

  // ── CRUD Resources ────────────────────────────────────────────────────────

  async function addResource(sectionId: string) {
    if (readOnly || saving) return;
    setResourceUploading(true);

    try {
      const url =
        resourceType === "FILE"
          ? (resourceFileUrl ?? "").trim()
          : resourceUrl.trim();
      if (!url) return;

      const newResource: SectionResource = {
        id: crypto.randomUUID(),
        type: resourceType,
        title: resourceTitle.trim(),
        url,
        ...(resourceType === "FILE" && resourceFileMeta
          ? {
              originalFileName: resourceFileMeta.name,
              sizeBytes: resourceFileMeta.sizeBytes,
              mimeType: resourceFileMeta.mimeType,
            }
          : {}),
      };

      const section = sections.find((s) => s.id === sectionId);
      if (!section) return;

      const oldSections = [...sections];
      const updatedResources = [...section.resources, newResource];

      setSections((prev) => patchSectionDescription(prev, sectionId, updatedResources));
      closePanel();

      toast.promise(pushResources(sectionId, updatedResources), {
        loading: "Attaching resource…",
        success: "Resource attached",
        error: () => {
          setSections(oldSections);
          return "Failed to attach resource";
        },
      });
    } finally {
      setResourceUploading(false);
    }
  }

  async function replaceResourceFile(
    sectionId: string,
    resourceId: string,
    url: string,
    meta?: { name: string; sizeBytes: number; mimeType?: string },
  ) {
    if (readOnly || saving) return;
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const oldSections = [...sections];
    const updatedResources = section.resources.map((r) =>
      r.id === resourceId
        ? {
            ...r,
            url,
            ...(meta
              ? {
                  originalFileName: meta.name,
                  sizeBytes: meta.sizeBytes,
                  mimeType: meta.mimeType,
                }
              : {}),
          }
        : r,
    );

    setSections((prev) => patchSectionDescription(prev, sectionId, updatedResources));

    toast.promise(pushResources(sectionId, updatedResources), {
      loading: "Updating file…",
      success: "File updated",
      error: () => {
        setSections(oldSections);
        return "Failed to update file";
      },
    });
  }

  async function removeResource(sectionId: string, resourceId: string) {
    if (readOnly || saving) return;
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;
    
    const oldSections = [...sections];
    const updatedResources = section.resources.filter((r) => r.id !== resourceId);
    
    // Optimistic remove
    setSections((prev) => patchSectionDescription(prev, sectionId, updatedResources));
    
    toast.promise(pushResources(sectionId, updatedResources), {
      loading: 'Removing resource...',
      success: 'Resource removed',
      error: () => {
        setSections(oldSections);
        return 'Failed to remove resource';
      }
    });
  }

  // ── DnD ───────────────────────────────────────────────────────────────────

  async function onDragEnd(event: DragEndEvent) {
    if (readOnly || saving) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const moved = arrayMove(sections, oldIndex, newIndex);
    const oldSections = [...sections];
    setSections(moved);
    
    toast.promise(
      runPending(async () => {
        const responses = await Promise.all(
          moved.map((s, i) =>
            fetch(`/api/tutor/courses/${courseId}/sections/${s.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ position: i + 1 }),
            }),
          ),
        );
        if (responses.some((r) => !r.ok)) throw new Error("Some updates failed");
      }),
      {
        loading: 'Saving order...',
        success: 'Order saved',
        error: () => {
          setSections(oldSections);
          return 'Failed to save order';
        }
      }
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return <p className="p-6 text-sm text-[var(--muted)]">Loading curriculum...</p>;
  if (error) return <p className="p-6 text-sm text-[#b32d0f]">{error}</p>;

  return (
    <TooltipProvider>
    <div className="space-y-6 px-3 py-4 sm:px-6 sm:py-6">
      {readOnly ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm text-[var(--muted)]">
          This course is pending review. Curriculum is read-only.
        </p>
      ) : null}
      <p className="text-sm text-[var(--muted)]">
        Expand a section to edit lessons, quizzes, and resources. Add buttons open a
        panel that stays visible on mobile.
      </p>
      {saving ? (
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--primary)]" />
          Saving changes…
        </p>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e) => void onDragEnd(e)}
      >
        <SortableContext
          items={sectionIds}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section, sectionIndex) => (
            <SortableSection
              key={section.id}
              id={section.id}
              disabled={interactionLocked}
              isExpanded={expandedSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
              titleRow={
                <div className=" w-full flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden mr-4">
                     <span className="shrink-0 text-sm font-bold text-[var(--foreground)]">{`Section ${sectionIndex + 1} : `}</span>
                    {editingSectionId === section.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={editingSectionTitle}
                          onChange={(e) => setEditingSectionTitle(e.target.value)}
                          disabled={interactionLocked}
                          autoFocus
                          className="min-w-0 flex-1 max-w-[300px] border border-[var(--border)] px-2 py-1 text-sm rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          type="button"
                          disabled={interactionLocked}
                          onClick={(e) => {
                            e.stopPropagation();
                            void renameSection(section.id, editingSectionTitle);
                          }}
                          className="rounded-full bg-emerald-100 p-1.5 text-emerald-700 hover:bg-emerald-200"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSectionId(null);
                            setEditingSectionTitle("");
                          }}
                          className="rounded-full bg-gray-100 p-1.5 text-gray-700 hover:bg-gray-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                       <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                        {section.title}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    {!editingSectionId && (
                      <Tooltip content="Rename section" side="top">
                        <button
                          type="button"
                          disabled={interactionLocked}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSectionId(section.id);
                            setEditingSectionTitle(section.title);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </Tooltip>
                    )}
                    <Tooltip content="Delete section" side="top">
                      <button
                        type="button"
                        disabled={interactionLocked}
                        onClick={(e) => {
                          e.stopPropagation();
                          void deleteSection(section.id);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </Tooltip>
                    <div className="h-4 w-px bg-slate-200 mx-1" />
                    {expandedSections.has(section.id) ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>
              }
            >
              {/* ── Lessons ─────────────────────────────────────────────── */}
              <div className="space-y-3">
                {section.lessons.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-[var(--border)] px-3 py-4 text-center text-xs text-[var(--muted)]">
                    No lessons yet. Use &quot;Add lesson&quot; below.
                  </p>
                ) : null}
                {section.lessons.map((lesson) => {
                  const lessonType: "VIDEO" | "ARTICLE" =
                    lesson.content === null ? "VIDEO" : "ARTICLE";
                  return (
                    <div
                      key={lesson.id}
                      className="rounded-xl border border-[var(--border)] bg-white p-3 sm:p-4"
                    >
                      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 flex-1 items-center gap-2.5">
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                              lessonType === "VIDEO"
                                ? "bg-violet-50 text-violet-700"
                                : "bg-emerald-50 text-emerald-700",
                            )}
                          >
                            {lessonType === "VIDEO" ? (
                              <FileVideo className="h-4 w-4" aria-hidden />
                            ) : (
                              <FileText className="h-4 w-4" aria-hidden />
                            )}
                          </div>
                          <input
                            defaultValue={lesson.title}
                            disabled={interactionLocked}
                            onBlur={(e) =>
                              queueLessonPatch(section.id, lesson.id, {
                                title: e.target.value,
                              })
                            }
                            className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1 py-1 text-sm font-semibold text-[var(--foreground)] focus:border-[var(--border)] focus:bg-[var(--surface-muted)] focus:outline-none"
                            aria-label="Lesson title"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={lessonType}
                            disabled={interactionLocked}
                            onChange={(e) => {
                              const next = e.target.value as "VIDEO" | "ARTICLE";
                              setSections((prev) =>
                                prev.map((sec) => {
                                  if (sec.id !== section.id) return sec;
                                  return {
                                    ...sec,
                                    lessons: sec.lessons.map((l) => {
                                      if (l.id !== lesson.id) return l;
                                      return next === "ARTICLE"
                                        ? {
                                            ...l,
                                            videoUrl: null,
                                            content: l.content ?? "",
                                          }
                                        : {
                                            ...l,
                                            content: null,
                                            videoUrl: l.videoUrl ?? null,
                                          };
                                    }),
                                  };
                                }),
                              );
                              queueLessonPatch(section.id, lesson.id, {
                                contentType: next,
                                value:
                                  next === "ARTICLE"
                                    ? (lesson.content ?? "")
                                    : (lesson.videoUrl ?? ""),
                              });
                            }}
                            className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 text-xs font-medium text-[var(--foreground)]"
                            aria-label="Lesson type"
                          >
                            <option value="VIDEO">Video</option>
                            <option value="ARTICLE">Article</option>
                          </select>
                          <button
                            type="button"
                            disabled={interactionLocked}
                            onClick={() => void deleteLesson(section.id, lesson.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                            aria-label="Delete lesson"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {lessonType === "ARTICLE" ? (
                        <RichTextArea
                          value={lesson.content ?? ""}
                          onChange={(html) => {
                            setSections((prev) =>
                              prev.map((sec) => {
                                if (sec.id !== section.id) return sec;
                                return {
                                  ...sec,
                                  lessons: sec.lessons.map((l) =>
                                    l.id === lesson.id
                                      ? {
                                          ...l,
                                          content: html,
                                          videoUrl: null,
                                        }
                                      : l,
                                  ),
                                };
                              }),
                            );
                            queueLessonPatch(section.id, lesson.id, {
                              contentType: "ARTICLE",
                              value: html,
                            });
                          }}
                          disabled={interactionLocked}
                          placeholder="Article content"
                          minHeightClass="min-h-[120px]"
                        />
                      ) : (
                        <FileUploader
                          purpose="lesson-video"
                          courseId={courseId}
                          compact
                          currentUrl={lesson.videoUrl}
                          onUploadComplete={(url) => {
                            setSections((prev) =>
                              prev.map((sec) => {
                                if (sec.id !== section.id) return sec;
                                return {
                                  ...sec,
                                  lessons: sec.lessons.map((l) =>
                                    l.id === lesson.id
                                      ? {
                                          ...l,
                                          videoUrl: url,
                                          content: null,
                                        }
                                      : l,
                                  ),
                                };
                              }),
                            );
                            queueLessonPatch(section.id, lesson.id, {
                              contentType: "VIDEO",
                              value: url,
                            });
                          }}
                          onRemove={() => {
                            setSections((prev) =>
                              prev.map((sec) => {
                                if (sec.id !== section.id) return sec;
                                return {
                                  ...sec,
                                  lessons: sec.lessons.map((l) =>
                                    l.id === lesson.id
                                      ? { ...l, videoUrl: null }
                                      : l,
                                  ),
                                };
                              }),
                            );
                            queueLessonPatch(section.id, lesson.id, {
                              contentType: "VIDEO",
                              value: "",
                            });
                          }}
                          disabled={interactionLocked}
                          showPreview={false}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Resources ───────────────────────────────────────────── */}
              {section.resources.length > 0 ? (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Resources
                  </p>
                  <ul className="space-y-2">
                    {section.resources.map((resource) => (
                      <li
                        key={resource.id}
                        className="rounded-xl border border-[var(--border)] bg-white p-3"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            {resource.type === "LINK" ? (
                              <Link2
                                className="h-4 w-4 shrink-0 text-[var(--primary)]"
                                aria-hidden
                              />
                            ) : (
                              <FileText
                                className="h-4 w-4 shrink-0 text-[var(--primary)]"
                                aria-hidden
                              />
                            )}
                            <span className="truncate text-sm font-medium text-[var(--foreground)]">
                              {resource.title}
                            </span>
                          </div>
                          {resource.type === "LINK" ? (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline"
                            >
                              Open
                              <ExternalLink className="h-3 w-3" aria-hidden />
                            </a>
                          ) : null}
                        </div>
                        {resource.type === "FILE" && !interactionLocked ? (
                          <FileUploader
                            purpose="resource-file"
                            courseId={courseId}
                            compact
                            currentUrl={resource.url}
                            fileName={resource.originalFileName}
                            onUploadComplete={(url, meta) =>
                              void replaceResourceFile(
                                section.id,
                                resource.id,
                                url,
                                meta,
                              )
                            }
                            onRemove={() =>
                              void removeResource(section.id, resource.id)
                            }
                            disabled={interactionLocked}
                            showPreview={false}
                          />
                        ) : !interactionLocked ? (
                          <button
                            type="button"
                            onClick={() =>
                              void removeResource(section.id, resource.id)
                            }
                            className="text-xs font-medium text-red-600 hover:underline"
                          >
                            Remove link
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* ── Quizzes & assignments ───────────────────────────────── */}
              {(section.quizzes.length > 0 ||
                section.assignmentItems.length > 0) && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Quizzes & assignments
                  </p>
                  <ul className="space-y-1.5">
                    {section.quizzes.map((quiz) => (
                      <li
                        key={quiz.id}
                        className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--foreground)]"
                      >
                        Quiz · {quiz.title}
                      </li>
                    ))}
                    {section.assignmentItems.map((a) => (
                      <li
                        key={a.id}
                        className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--foreground)]"
                      >
                        Assignment · {a.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── Add actions ─────────────────────────────────────────── */}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
                <button
                  type="button"
                  disabled={interactionLocked}
                  onClick={() => {
                    openPanel({ kind: "lesson", sectionId: section.id });
                    setNewLessonType(suggestContentType(section.title));
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--primary)] bg-white px-3 text-xs font-semibold text-[var(--primary)] transition hover:bg-[var(--primary)]/5 disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Add lesson
                </button>
                <button
                  type="button"
                  disabled={interactionLocked}
                  onClick={() => {
                    openPanel({ kind: "item", sectionId: section.id });
                    setItemTitle("");
                    setItemType("QUIZ");
                    setQuizMcqRows([createEmptyMcqRow()]);
                    setAssignmentDescription("");
                    setAssignmentDueDays("7");
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Quiz / assignment
                </button>
                <button
                  type="button"
                  disabled={interactionLocked}
                  onClick={() => {
                    openPanel({ kind: "resource", sectionId: section.id });
                    setResourceType("LINK");
                    setResourceTitle("");
                    setResourceUrl("");
                    setResourceFileUrl(null);
                    setResourceFileMeta(null);
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Resource
                </button>
              </div>

              <CurriculumFormPanel
                open={panelOpenFor(section.id, "lesson")}
                onClose={closePanel}
                title="Add lesson"
                description="Video or article for this section."
              >
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                    <input
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      disabled={interactionLocked}
                      placeholder="Lesson title"
                      className={fieldClass}
                    />
                    <select
                      value={newLessonType}
                      disabled={interactionLocked}
                      onChange={(e) => {
                        setNewLessonType(e.target.value as "VIDEO" | "ARTICLE");
                        setNewLessonVideoUrl(null);
                      }}
                      className={fieldClass}
                    >
                      <option value="VIDEO">Video</option>
                      <option value="ARTICLE">Article</option>
                    </select>
                  </div>
                  {newLessonType === "ARTICLE" ? (
                    <RichTextArea
                      value={newLessonArticleContent}
                      onChange={setNewLessonArticleContent}
                      disabled={interactionLocked}
                      placeholder="Article content"
                      minHeightClass="min-h-[140px]"
                    />
                  ) : (
                    <FileUploader
                      purpose="lesson-video"
                      courseId={courseId}
                      compact
                      disabled={interactionLocked}
                      currentUrl={newLessonVideoUrl}
                      onUploadComplete={(url) => setNewLessonVideoUrl(url)}
                      onRemove={() => setNewLessonVideoUrl(null)}
                      showPreview={false}
                    />
                  )}
                  <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border)] pt-4">
                    <button
                      type="button"
                      disabled={interactionLocked}
                      onClick={closePanel}
                      className="h-10 rounded-lg border border-[var(--border)] px-4 text-sm font-medium text-[var(--muted)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={interactionLocked || !canAddNewLesson}
                      onClick={() =>
                        newLessonType === "ARTICLE"
                          ? void addLessonWithContent(section.id)
                          : void addLessonWithVideo(
                              section.id,
                              newLessonVideoUrl!,
                            )
                      }
                      className="h-10 rounded-lg bg-[var(--primary)] px-5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Add lesson
                    </button>
                  </div>
                </div>
              </CurriculumFormPanel>

              <CurriculumFormPanel
                open={panelOpenFor(section.id, "item")}
                onClose={closePanel}
                title="Add quiz or assignment"
                description="Quizzes use multiple-choice questions; assignments include instructions."
              >
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      value={itemType}
                      disabled={interactionLocked}
                      onChange={(e) =>
                        setItemType(e.target.value as "QUIZ" | "ASSIGNMENT")
                      }
                      className={fieldClass}
                    >
                      <option value="QUIZ">Quiz</option>
                      <option value="ASSIGNMENT">Assignment</option>
                    </select>
                    <input
                      value={itemTitle}
                      onChange={(e) => setItemTitle(e.target.value)}
                      disabled={interactionLocked}
                      placeholder="Title"
                      className={fieldClass}
                    />
                  </div>
                  {itemType === "QUIZ" ? (
                    <div className="space-y-3">
                      <p className="text-xs text-[var(--muted)]">
                        One correct answer and three distractors per question.
                      </p>
                      {quizMcqRows.map((row, rowIndex) => (
                        <div
                          key={row.id}
                          className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/50 p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-[var(--muted)]">
                              Question {rowIndex + 1}
                            </span>
                            {quizMcqRows.length > 1 ? (
                              <button
                                type="button"
                                disabled={interactionLocked}
                                onClick={() =>
                                  setQuizMcqRows((prev) =>
                                    prev.filter((r) => r.id !== row.id),
                                  )
                                }
                                className="text-xs font-medium text-red-600 hover:underline"
                              >
                                Remove
                              </button>
                            ) : null}
                          </div>
                          <input
                            value={row.prompt}
                            onChange={(e) =>
                              setQuizMcqRows((prev) =>
                                prev.map((r) =>
                                  r.id === row.id
                                    ? { ...r, prompt: e.target.value }
                                    : r,
                                ),
                              )
                            }
                            disabled={interactionLocked}
                            placeholder="Question"
                            className={fieldClass}
                          />
                          <input
                            value={row.correctAnswer}
                            onChange={(e) =>
                              setQuizMcqRows((prev) =>
                                prev.map((r) =>
                                  r.id === row.id
                                    ? { ...r, correctAnswer: e.target.value }
                                    : r,
                                ),
                              )
                            }
                            disabled={interactionLocked}
                            placeholder="Correct answer"
                            className={fieldClass}
                          />
                          <div className="grid gap-2 sm:grid-cols-3">
                            {(
                              [
                                ["wrong1", "Distractor 1"],
                                ["wrong2", "Distractor 2"],
                                ["wrong3", "Distractor 3"],
                              ] as const
                            ).map(([key, label]) => (
                              <input
                                key={key}
                                value={row[key]}
                                onChange={(e) =>
                                  setQuizMcqRows((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id
                                        ? { ...r, [key]: e.target.value }
                                        : r,
                                    ),
                                  )
                                }
                                disabled={interactionLocked}
                                placeholder={label}
                                className={fieldClass}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        disabled={interactionLocked}
                        onClick={() =>
                          setQuizMcqRows((prev) => [...prev, createEmptyMcqRow()])
                        }
                        className="text-xs font-semibold text-[var(--primary)] hover:underline"
                      >
                        + Another question
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <RichTextArea
                        value={assignmentDescription}
                        onChange={setAssignmentDescription}
                        disabled={interactionLocked}
                        placeholder="Assignment instructions"
                        minHeightClass="min-h-[120px]"
                      />
                      <input
                        value={assignmentDueDays}
                        onChange={(e) => setAssignmentDueDays(e.target.value)}
                        disabled={interactionLocked}
                        placeholder="Due in days (e.g. 7)"
                        className={fieldClass}
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border)] pt-4">
                    <button
                      type="button"
                      disabled={interactionLocked}
                      onClick={closePanel}
                      className="h-10 rounded-lg border border-[var(--border)] px-4 text-sm font-medium text-[var(--muted)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={interactionLocked || !canAddItem}
                      onClick={() => void addItem(section.id)}
                      className="h-10 rounded-lg bg-[var(--primary)] px-5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Add {itemType === "QUIZ" ? "quiz" : "assignment"}
                    </button>
                  </div>
                </div>
              </CurriculumFormPanel>

              <CurriculumFormPanel
                open={panelOpenFor(section.id, "resource")}
                onClose={closePanel}
                title="Add resource"
                description="Link to an external page or upload a file for students."
              >
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setResourceType("LINK");
                        setResourceFileUrl(null);
                        setResourceFileMeta(null);
                      }}
                      className={cn(
                        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-semibold transition",
                        resourceType === "LINK"
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                          : "border-[var(--border)] bg-white text-[var(--foreground)]",
                      )}
                    >
                      <Link2 className="h-3.5 w-3.5" aria-hidden />
                      Link
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResourceType("FILE");
                        setResourceUrl("");
                      }}
                      className={cn(
                        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-semibold transition",
                        resourceType === "FILE"
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                          : "border-[var(--border)] bg-white text-[var(--foreground)]",
                      )}
                    >
                      <Upload className="h-3.5 w-3.5" aria-hidden />
                      File
                    </button>
                  </div>
                  <input
                    value={resourceTitle}
                    onChange={(e) => setResourceTitle(e.target.value)}
                    disabled={interactionLocked}
                    placeholder="Resource title"
                    className={fieldClass}
                  />
                  {resourceType === "LINK" ? (
                    <input
                      value={resourceUrl}
                      onChange={(e) => setResourceUrl(e.target.value)}
                      disabled={interactionLocked}
                      placeholder="https://..."
                      className={fieldClass}
                    />
                  ) : (
                    <FileUploader
                      purpose="resource-file"
                      courseId={courseId}
                      compact
                      disabled={interactionLocked}
                      currentUrl={resourceFileUrl}
                      fileName={resourceFileMeta?.name}
                      onUploadComplete={(url, meta) => {
                        setResourceFileUrl(url);
                        if (meta) setResourceFileMeta(meta);
                      }}
                      onRemove={() => {
                        setResourceFileUrl(null);
                        setResourceFileMeta(null);
                      }}
                      showPreview={false}
                    />
                  )}
                  <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border)] pt-4">
                    <button
                      type="button"
                      disabled={interactionLocked}
                      onClick={closePanel}
                      className="h-10 rounded-lg border border-[var(--border)] px-4 text-sm font-medium text-[var(--muted)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={
                        !canAddResource ||
                        resourceUploading ||
                        interactionLocked
                      }
                      onClick={() => void addResource(section.id)}
                      className="h-10 rounded-lg bg-[var(--primary)] px-5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {resourceUploading ? "Saving…" : "Add resource"}
                    </button>
                  </div>
                </div>
              </CurriculumFormPanel>
            </SortableSection>
          ))}
        </SortableContext>
      </DndContext>

      {/* ── New section form ─────────────────────────────────────────────── */}
      <Separator className="my-2" />
      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/40 p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-bold text-[var(--foreground)]">
          New section
        </h3>
        <div className="grid gap-3">
          <input
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            maxLength={120}
            disabled={interactionLocked}
            placeholder="Section title"
            className={fieldClass}
          />
          <input
            value={newSectionObjective}
            onChange={(e) => setNewSectionObjective(e.target.value)}
            maxLength={500}
            disabled={interactionLocked}
            placeholder="Learning objective (optional)"
            className={fieldClass}
          />
          <div className="flex justify-end">
            <button
              type="button"
              disabled={interactionLocked || !canAddSection}
              onClick={() => void createSection()}
              className="h-10 rounded-lg bg-[var(--primary)] px-5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Add section
            </button>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}

// ── SortableSection ───────────────────────────────────────────────────────────

function SortableSection(props: {
  id: string;
  disabled?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  titleRow: ReactNode;
  children: ReactNode;
}) {
  const { id, disabled, isExpanded, onToggle, titleRow, children } = props;
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({
    id,
    disabled: Boolean(disabled),
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      // Clinical card: flat rounded border, no shadow on collapsed, subtle on expanded
      className={cn(
        "mb-3 rounded-xl border border-[var(--border)] bg-white transition-colors",
        isExpanded && "shadow-sm",
      )}
      {...attributes}
    >
      <div
        className={cn(
          "flex cursor-pointer select-none items-center gap-2 rounded-t-xl px-4 py-3 transition-colors",
          isExpanded
            ? "border-b border-[var(--border)] bg-[var(--surface-muted)]/50"
            : "hover:bg-[var(--surface-muted)]/30",
        )}
        onClick={onToggle}
      >
        <Tooltip content="Drag to reorder" side="right">
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...listeners}
            disabled={disabled}
            aria-label="Drag to reorder section"
            className="shrink-0 touch-none cursor-grab rounded-lg p-1.5 text-slate-300 transition-all hover:bg-slate-100 hover:text-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </Tooltip>
        {titleRow}
      </div>
      {isExpanded && (
        <div className="rounded-b-xl p-4 sm:p-5">
          {children}
        </div>
      )}
    </div>
  );
}
