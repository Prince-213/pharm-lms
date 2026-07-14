"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
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
  Play,
  Plus,
  Trash2,
  Upload,
  X,
  ChevronDown,
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
import {
  CurriculumEditorSkeleton,
  CurriculumEmptyState,
  CurriculumField,
  CurriculumItemMeta,
  CurriculumList,
  CurriculumListItem,
  CurriculumReadOnlyBanner,
  CurriculumSavingIndicator,
  CurriculumSubsection,
  formatSectionSummary,
  NewSectionCard,
  PanelFormActions,
  selectClassName,
} from "@/components/mentor/curriculum-editor-ui";
import { RichTextArea } from "@/components/rich-text-area";
import { CurriculumFormPanel } from "@/components/mentor/curriculum-form-panel";
import { FileUploader } from "@/components/upload/file-uploader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatApiErrorBody } from "@/lib/api-error-message";
import { toast } from "sonner";
import { notifyPortalMutation } from "@/lib/client/notify-portal-mutation";
import { parseSectionDescription as parseDescription } from "@/lib/curriculum";
import { deriveQuizTitle } from "@/lib/curriculum/derive-quiz-title";

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

// ── Main Component ────────────────────────────────────────────────────────────

export function CurriculumEditorV2({ courseId }: { courseId: string }) {
  const { readOnly, registerStepHandlers } = useCourseStudio();
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
  const [mediaUploadCount, setMediaUploadCount] = useState(0);
  const fileUploading = mediaUploadCount > 0;
  const panelLocked = interactionLocked || fileUploading;
  const handleMediaUploadingChange = useCallback((uploading: boolean) => {
    setMediaUploadCount((count) =>
      uploading ? count + 1 : Math.max(0, count - 1),
    );
  }, []);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [sectionErrors, setSectionErrors] = useState<
    Record<string, { title?: string; content?: string }>
  >({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ─────────────────────────────────────────────────────────────────────────

  const canAddSection = useMemo(() => newSectionTitle.trim().length >= 3, [newSectionTitle]);
  const canAddItem = useMemo(() => {
    if (itemType === "QUIZ") return mcqRowsValid(quizMcqRows);
    return itemTitle.trim().length >= 2;
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
      const message = formatApiErrorBody(j);
      setError(message);
      toast.error(message);
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
      setCurrentStepIndex(0);
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
      const result = await action();
      if (result instanceof Response) {
        if (result.ok) notifyPortalMutation();
      } else {
        notifyPortalMutation();
      }
      return result;
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

  function focusSection(index: number) {
    const section = sections[index];
    if (!section) return;
    setCurrentStepIndex(index);
    setExpandedSections((prev) => new Set([...prev, section.id]));
    requestAnimationFrame(() => {
      sectionRefs.current[section.id]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function validateSectionAt(index: number): boolean {
    const section = sections[index];
    if (!section) return true;
    const errors: { title?: string; content?: string } = {};
    if (!section.title.trim()) {
      errors.title = "Section title is required.";
    }
    const itemCount =
      section.lessons.length +
      section.quizzes.length +
      section.assignmentItems.length +
      section.resources.length;
    if (itemCount === 0) {
      errors.content =
        "Add at least one lesson, quiz, assignment, or resource.";
    }
    if (activePanel?.sectionId === section.id) {
      errors.content = "Finish or cancel the open form before continuing.";
    }
    if (Object.keys(errors).length > 0) {
      setSectionErrors((prev) => ({ ...prev, [section.id]: errors }));
      return false;
    }
    setSectionErrors((prev) => {
      const next = { ...prev };
      delete next[section.id];
      return next;
    });
    return true;
  }

  function handlePrevSection() {
    if (currentStepIndex > 0) {
      focusSection(currentStepIndex - 1);
    }
  }

  useEffect(() => {
    registerStepHandlers({
      navigationLocked:
        interactionLocked || resourceUploading || fileUploading,
      onNext: () => {
        if (sections.length === 0) {
          toast.error("Add at least one section before continuing.");
          return false;
        }
        if (!validateSectionAt(currentStepIndex)) {
          toast.error("Complete this section before moving on.");
          focusSection(currentStepIndex);
          return false;
        }
        if (currentStepIndex < sections.length - 1) {
          focusSection(currentStepIndex + 1);
          return false;
        }
        return true;
      },
      onBack: () => {
        if (currentStepIndex > 0) {
          focusSection(currentStepIndex - 1);
          return false;
        }
        return true;
      },
    });
    return () => registerStepHandlers(null);
  }, [
    registerStepHandlers,
    sections,
    currentStepIndex,
    interactionLocked,
    resourceUploading,
    fileUploading,
    activePanel,
  ]);

  function toggleSection(id: string) {
    const index = sections.findIndex((s) => s.id === id);
    if (index >= 0) setCurrentStepIndex(index);
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
    const resolvedTitle =
      submittedType === "QUIZ"
        ? deriveQuizTitle(quizQuestions ?? [])
        : itemTitle.trim();
    const tempId = crypto.randomUUID();

    // Optimistic UI
    const tempItem = {
      id: tempId,
      title: resolvedTitle,
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
    closePanel();

    const res = await runPending(() =>
      fetch(`/api/tutor/courses/${courseId}/sections/${sectionId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: submittedType,
          title: submittedType === "ASSIGNMENT" ? resolvedTitle : undefined,
          quizQuestions: submittedType === "QUIZ" ? quizQuestions : undefined,
          assignmentDescription: submittedType === "ASSIGNMENT" ? assignmentDescription : undefined,
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

  if (loading) return <CurriculumEditorSkeleton />;
  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
    <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
      {readOnly ? <CurriculumReadOnlyBanner /> : null}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Build your course outline section by section. Add lectures, assessments,
          and resources, then use Next to validate each section before moving on.
        </p>
      </div>
      {saving ? <CurriculumSavingIndicator /> : null}
      {fileUploading ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Upload className="size-3.5 animate-pulse text-primary" aria-hidden />
          Uploading file… Other actions are disabled until the upload finishes.
        </p>
      ) : null}

      {sections.length === 0 ? (
        <CurriculumEmptyState message="Start by adding your first section below. Each section groups related lectures and assessments." />
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
              sectionRef={(el) => {
                sectionRefs.current[section.id] = el;
              }}
              disabled={interactionLocked}
              isExpanded={expandedSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
              titleRow={
                <div className="flex w-full min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <Badge variant="outline" className="shrink-0 font-semibold">
                        Section {sectionIndex + 1}
                      </Badge>
                      {editingSectionId === section.id ? (
                        <div
                          className="flex min-w-0 flex-1 items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Input
                            value={editingSectionTitle}
                            onChange={(e) => setEditingSectionTitle(e.target.value)}
                            disabled={interactionLocked}
                            autoFocus
                            className="h-8 max-w-xs"
                            aria-label="Section title"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon-sm"
                            disabled={interactionLocked}
                            onClick={() =>
                              void renameSection(section.id, editingSectionTitle)
                            }
                            aria-label="Save section title"
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={readOnly}
                            onClick={() => {
                              setEditingSectionId(null);
                              setEditingSectionTitle("");
                            }}
                            aria-label="Cancel rename"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <p className="truncate text-sm font-semibold text-foreground">
                          {section.title}
                        </p>
                      )}
                    </div>
                    {!expandedSections.has(section.id) ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {formatSectionSummary(section)}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5">
                    {!editingSectionId ? (
                      <SimpleTooltip content="Rename section" side="top">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={interactionLocked}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSectionId(section.id);
                            setEditingSectionTitle(section.title);
                          }}
                          aria-label="Rename section"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      </SimpleTooltip>
                    ) : null}
                    <SimpleTooltip content="Delete section" side="top">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={interactionLocked}
                        className="text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          void deleteSection(section.id);
                        }}
                        aria-label="Delete section"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </SimpleTooltip>
                    <div className="mx-1 hidden h-4 w-px bg-border sm:block" />
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        expandedSections.has(section.id) && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </div>
                </div>
              }
            >
              {sectionErrors[section.id]?.content ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    {sectionErrors[section.id]?.content}
                  </AlertDescription>
                </Alert>
              ) : null}
              {sectionErrors[section.id]?.title ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    {sectionErrors[section.id]?.title}
                  </AlertDescription>
                </Alert>
              ) : null}
              {/* ── Lectures ──────────────────────────────────────────────── */}
              <CurriculumSubsection
                tone="lectures"
                description="Video or article content students complete in order."
                count={section.lessons.length}
              >
                {section.lessons.length === 0 ? (
                  <CurriculumEmptyState message='No lectures yet. Click "Add lecture" below.' />
                ) : (
                  <CurriculumList>
                {section.lessons.map((lesson, lessonIndex) => {
                  const lessonType: "VIDEO" | "ARTICLE" =
                    lesson.content === null ? "VIDEO" : "ARTICLE";
                  return (
                    <CurriculumListItem key={lesson.id} className="space-y-4" index={lessonIndex + 1}>
                      <CurriculumItemMeta
                        icon={
                          lessonType === "VIDEO" ? (
                            <Play
                              className="size-2.5"
                              fill="currentColor"
                              aria-hidden
                            />
                          ) : (
                            <FileText className="size-4" aria-hidden />
                          )
                        }
                        badge={lessonType === "VIDEO" ? "Video" : "Article"}
                        badgeVariant="outline"
                        title={
                          <Input
                            defaultValue={lesson.title}
                            disabled={interactionLocked}
                            onBlur={(e) =>
                              queueLessonPatch(section.id, lesson.id, {
                                title: e.target.value,
                              })
                            }
                            className="h-8 border-transparent bg-transparent px-0 font-medium shadow-none focus-visible:border-input focus-visible:bg-background"
                            aria-label={`Lecture ${lessonIndex + 1} title`}
                          />
                        }
                        actions={
                          <>
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
                              className={cn(selectClassName, "h-8 w-[110px]")}
                              aria-label="Lecture type"
                            >
                              <option value="VIDEO">Video</option>
                              <option value="ARTICLE">Article</option>
                            </select>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon-sm"
                              disabled={interactionLocked}
                              onClick={() => void deleteLesson(section.id, lesson.id)}
                              aria-label="Delete lecture"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </>
                        }
                      />

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
                          placeholder="Write the article content for this lecture."
                          minHeightClass="min-h-[120px]"
                        />
                      ) : (
                        <FileUploader
                          purpose="lesson-video"
                          courseId={courseId}
                          hideLabel
                          onUploadingChange={handleMediaUploadingChange}
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
                    </CurriculumListItem>
                  );
                })}
                  </CurriculumList>
                )}
              </CurriculumSubsection>

              {/* ── Resources ───────────────────────────────────────────── */}
              <CurriculumSubsection
                tone="resources"
                description="Downloadable files and external links for this section."
                count={section.resources.length}
                className="mt-5"
              >
                {section.resources.length === 0 ? (
                  <CurriculumEmptyState message='No resources yet. Click "Resource" below to add a file or link.' />
                ) : (
                  <CurriculumList>
                    {section.resources.map((resource) => (
                      <CurriculumListItem key={resource.id} className="space-y-3">
                        <CurriculumItemMeta
                          icon={
                            resource.type === "LINK" ? (
                              <Link2 className="size-4" aria-hidden />
                            ) : (
                              <FileText className="size-4" aria-hidden />
                            )
                          }
                          badge={resource.type === "LINK" ? "Link" : "File"}
                          badgeVariant="outline"
                          title={
                            <span className="truncate text-sm font-medium text-foreground">
                              {resource.title}
                            </span>
                          }
                          actions={
                            resource.type === "LINK" ? (
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                              >
                                Open
                                <ExternalLink className="size-3" aria-hidden />
                              </a>
                            ) : null
                          }
                        />
                        {resource.type === "FILE" && !interactionLocked ? (
                          <FileUploader
                            purpose="curriculum-resource"
                            courseId={courseId}
                            hideLabel
                            onUploadingChange={handleMediaUploadingChange}
                            compact
                            currentUrl={resource.url}
                            fileName={resource.originalFileName}
                            fileSizeBytes={resource.sizeBytes}
                            mimeType={resource.mimeType}
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
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto px-0 text-destructive"
                            onClick={() =>
                              void removeResource(section.id, resource.id)
                            }
                          >
                            Remove link
                          </Button>
                        ) : null}
                      </CurriculumListItem>
                    ))}
                  </CurriculumList>
                )}
              </CurriculumSubsection>

              {/* ── Quizzes & assignments ───────────────────────────────── */}
              {(section.quizzes.length > 0 ||
                section.assignmentItems.length > 0) && (
                <CurriculumSubsection
                  tone="assessments"
                  title="Assessments"
                  description="Quizzes and assignments that check understanding."
                  count={section.quizzes.length + section.assignmentItems.length}
                  className="mt-5"
                >
                  <CurriculumList>
                    {section.quizzes.map((quiz) => (
                      <CurriculumListItem key={quiz.id}>
                        <CurriculumItemMeta
                          icon={<FileText className="size-4" aria-hidden />}
                          badge="Quiz"
                          badgeVariant="secondary"
                          title={
                            <span className="text-sm font-medium text-foreground">
                              {quiz.title}
                            </span>
                          }
                        />
                      </CurriculumListItem>
                    ))}
                    {section.assignmentItems.map((a) => (
                      <CurriculumListItem key={a.id}>
                        <CurriculumItemMeta
                          icon={<FileText className="size-4" aria-hidden />}
                          badge="Assignment"
                          badgeVariant="secondary"
                          title={
                            <span className="text-sm font-medium text-foreground">
                              {a.title}
                            </span>
                          }
                        />
                      </CurriculumListItem>
                    ))}
                  </CurriculumList>
                </CurriculumSubsection>
              )}

              {/* ── Add actions ─────────────────────────────────────────── */}
              <div className="mt-6 flex flex-wrap gap-2 rounded-lg border border-dashed border-[#d1d7dc] bg-[#f7f9fa] px-4 py-4">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  disabled={panelLocked}
                  onClick={() => {
                    if (fileUploading) return;
                    openPanel({ kind: "lesson", sectionId: section.id });
                    setNewLessonType(suggestContentType(section.title));
                  }}
                >
                  <Plus className="size-3.5" aria-hidden />
                  Add lecture
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={panelLocked}
                  onClick={() => {
                    if (fileUploading) return;
                    openPanel({ kind: "item", sectionId: section.id });
                    setItemTitle("");
                    setItemType("QUIZ");
                    setQuizMcqRows([createEmptyMcqRow()]);
                    setAssignmentDescription("");
                  }}
                >
                  <Plus className="size-3.5" aria-hidden />
                  Quiz / assignment
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={panelLocked}
                  onClick={() => {
                    if (fileUploading) return;
                    openPanel({ kind: "resource", sectionId: section.id });
                    setResourceType("LINK");
                    setResourceTitle("");
                    setResourceUrl("");
                    setResourceFileUrl(null);
                    setResourceFileMeta(null);
                  }}
                >
                  <Plus className="size-3.5" aria-hidden />
                  Resource
                </Button>
              </div>

              <CurriculumFormPanel
                open={panelOpenFor(section.id, "lesson")}
                onClose={closePanel}
                closeDisabled={fileUploading}
                title="Add lecture"
                description="Choose video or article content for this section."
              >
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                    <CurriculumField label="Lecture title" htmlFor={`lesson-title-${section.id}`}>
                      <Input
                        id={`lesson-title-${section.id}`}
                        value={newLessonTitle}
                        onChange={(e) => setNewLessonTitle(e.target.value)}
                        disabled={interactionLocked}
                        placeholder="e.g. Introduction to the topic"
                      />
                    </CurriculumField>
                    <CurriculumField label="Content type" htmlFor={`lesson-type-${section.id}`}>
                      <select
                        id={`lesson-type-${section.id}`}
                        value={newLessonType}
                        disabled={panelLocked}
                        onChange={(e) => {
                          if (fileUploading) return;
                          setNewLessonType(e.target.value as "VIDEO" | "ARTICLE");
                          setNewLessonVideoUrl(null);
                        }}
                        className={selectClassName}
                      >
                        <option value="VIDEO">Video</option>
                        <option value="ARTICLE">Article</option>
                      </select>
                    </CurriculumField>
                  </div>
                  {newLessonType === "ARTICLE" ? (
                    <CurriculumField label="Article body">
                      <RichTextArea
                        value={newLessonArticleContent}
                        onChange={setNewLessonArticleContent}
                        disabled={interactionLocked}
                        placeholder="Write the lecture content students will read."
                        minHeightClass="min-h-[140px]"
                      />
                    </CurriculumField>
                  ) : (
                    <FileUploader
                      purpose="lesson-video"
                      courseId={courseId}
                      hideLabel
                      onUploadingChange={handleMediaUploadingChange}
                      compact
                      disabled={interactionLocked}
                      currentUrl={newLessonVideoUrl}
                      onUploadComplete={(url) => setNewLessonVideoUrl(url)}
                      onRemove={() => setNewLessonVideoUrl(null)}
                      showPreview={false}
                    />
                  )}
                  <PanelFormActions
                    onCancel={closePanel}
                    cancelDisabled={panelLocked}
                    submitDisabled={panelLocked || !canAddNewLesson}
                    submitLabel={fileUploading ? "Uploading…" : "Add lecture"}
                    onSubmit={() =>
                      newLessonType === "ARTICLE"
                        ? void addLessonWithContent(section.id)
                        : void addLessonWithVideo(section.id, newLessonVideoUrl!)
                    }
                  />
                </div>
              </CurriculumFormPanel>

              <CurriculumFormPanel
                open={panelOpenFor(section.id, "item")}
                onClose={closePanel}
                closeDisabled={fileUploading}
                title="Add quiz or assignment"
                description="Quizzes use multiple-choice questions. Assignments include instructions and a due date."
              >
                <div className="space-y-4">
                  {itemType === "ASSIGNMENT" ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <CurriculumField label="Type" htmlFor={`item-type-${section.id}`}>
                        <select
                          id={`item-type-${section.id}`}
                          value={itemType}
                          disabled={interactionLocked}
                          onChange={(e) =>
                            setItemType(e.target.value as "QUIZ" | "ASSIGNMENT")
                          }
                          className={selectClassName}
                        >
                          <option value="QUIZ">Quiz</option>
                          <option value="ASSIGNMENT">Assignment</option>
                        </select>
                      </CurriculumField>
                      <CurriculumField label="Title" htmlFor={`item-title-${section.id}`}>
                        <Input
                          id={`item-title-${section.id}`}
                          value={itemTitle}
                          onChange={(e) => setItemTitle(e.target.value)}
                          disabled={interactionLocked}
                          placeholder="Assignment title"
                        />
                      </CurriculumField>
                    </div>
                  ) : (
                    <CurriculumField label="Type" htmlFor={`item-type-${section.id}`}>
                      <select
                        id={`item-type-${section.id}`}
                        value={itemType}
                        disabled={interactionLocked}
                        onChange={(e) =>
                          setItemType(e.target.value as "QUIZ" | "ASSIGNMENT")
                        }
                        className={selectClassName}
                      >
                        <option value="QUIZ">Quiz</option>
                        <option value="ASSIGNMENT">Assignment</option>
                      </select>
                    </CurriculumField>
                  )}
                  {itemType === "QUIZ" ? (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        Add one correct answer and three distractors per question.
                        The first question becomes the quiz label for students.
                      </p>
                      {quizMcqRows.map((row, rowIndex) => (
                        <div
                          key={row.id}
                          className="space-y-3 rounded-lg border border-border bg-muted/30 p-4"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-muted-foreground">
                              Question {rowIndex + 1}
                            </span>
                            {quizMcqRows.length > 1 ? (
                              <Button
                                type="button"
                                variant="link"
                                size="sm"
                                disabled={interactionLocked}
                                className="h-auto px-0 text-destructive"
                                onClick={() =>
                                  setQuizMcqRows((prev) =>
                                    prev.filter((r) => r.id !== row.id),
                                  )
                                }
                              >
                                Remove
                              </Button>
                            ) : null}
                          </div>
                          <Input
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
                          />
                          <Input
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
                          />
                          <div className="grid gap-2 sm:grid-cols-3">
                            {(
                              [
                                ["wrong1", "Distractor 1"],
                                ["wrong2", "Distractor 2"],
                                ["wrong3", "Distractor 3"],
                              ] as const
                            ).map(([key, label]) => (
                              <Input
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
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        disabled={interactionLocked}
                        className="h-auto px-0"
                        onClick={() =>
                          setQuizMcqRows((prev) => [...prev, createEmptyMcqRow()])
                        }
                      >
                        + Add another question
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <CurriculumField label="Instructions">
                        <RichTextArea
                          value={assignmentDescription}
                          onChange={setAssignmentDescription}
                          disabled={interactionLocked}
                          placeholder="Describe what students should submit."
                          minHeightClass="min-h-[120px]"
                        />
                      </CurriculumField>
                    </div>
                  )}
                  <PanelFormActions
                    onCancel={closePanel}
                    cancelDisabled={panelLocked}
                    submitDisabled={panelLocked || !canAddItem}
                    submitLabel={
                      itemType === "QUIZ" ? "Add quiz" : "Add assignment"
                    }
                    onSubmit={() => void addItem(section.id)}
                  />
                </div>
              </CurriculumFormPanel>

              <CurriculumFormPanel
                open={panelOpenFor(section.id, "resource")}
                onClose={closePanel}
                closeDisabled={fileUploading}
                title="Add resource"
                description="Link to an external page or upload a document file (PDF, Word, Excel, PowerPoint, or TXT) for students."
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={resourceType === "LINK" ? "default" : "outline"}
                      disabled={fileUploading}
                      onClick={() => {
                        if (fileUploading) return;
                        setResourceType("LINK");
                        setResourceFileUrl(null);
                        setResourceFileMeta(null);
                      }}
                    >
                      <Link2 className="size-3.5" aria-hidden />
                      External link
                    </Button>
                    <Button
                      type="button"
                      variant={resourceType === "FILE" ? "default" : "outline"}
                      disabled={fileUploading}
                      onClick={() => {
                        if (fileUploading) return;
                        setResourceType("FILE");
                        setResourceUrl("");
                      }}
                    >
                      <Upload className="size-3.5" aria-hidden />
                      Document file
                    </Button>
                  </div>
                  <CurriculumField
                    label="Resource title"
                    htmlFor={`resource-title-${section.id}`}
                  >
                    <Input
                      id={`resource-title-${section.id}`}
                      value={resourceTitle}
                      onChange={(e) => setResourceTitle(e.target.value)}
                      disabled={interactionLocked}
                      placeholder="e.g. Study guide"
                    />
                  </CurriculumField>
                  {resourceType === "LINK" ? (
                    <CurriculumField
                      label="URL"
                      htmlFor={`resource-url-${section.id}`}
                    >
                      <Input
                        id={`resource-url-${section.id}`}
                        value={resourceUrl}
                        onChange={(e) => setResourceUrl(e.target.value)}
                        disabled={interactionLocked}
                        placeholder="https://..."
                      />
                    </CurriculumField>
                  ) : (
                    <FileUploader
                      purpose="curriculum-resource"
                      courseId={courseId}
                      hideLabel
                      onUploadingChange={handleMediaUploadingChange}
                      compact
                      disabled={interactionLocked}
                      currentUrl={resourceFileUrl}
                      fileName={resourceFileMeta?.name}
                      fileSizeBytes={resourceFileMeta?.sizeBytes}
                      mimeType={resourceFileMeta?.mimeType}
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
                  <PanelFormActions
                    onCancel={closePanel}
                    cancelDisabled={panelLocked}
                    submitDisabled={
                      !canAddResource ||
                      resourceUploading ||
                      panelLocked
                    }
                    submitLabel={
                      fileUploading
                        ? "Uploading…"
                        : resourceUploading
                          ? "Saving…"
                          : "Add resource"
                    }
                    onSubmit={() => void addResource(section.id)}
                  />
                </div>
              </CurriculumFormPanel>
            </SortableSection>
          ))}
        </SortableContext>
      </DndContext>

      {/* ── New section form ─────────────────────────────────────────────── */}
      <Separator className="my-2" />
      <NewSectionCard>
        <CurriculumField label="Section title" htmlFor="new-section-title">
          <Input
            id="new-section-title"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            maxLength={120}
            disabled={interactionLocked}
            placeholder="e.g. Getting started"
          />
        </CurriculumField>
        <CurriculumField
          label="Learning objective"
          htmlFor="new-section-objective"
          hint="Optional. Helps students understand what they'll learn in this section."
        >
          <Input
            id="new-section-objective"
            value={newSectionObjective}
            onChange={(e) => setNewSectionObjective(e.target.value)}
            maxLength={500}
            disabled={interactionLocked}
            placeholder="Students will be able to…"
          />
        </CurriculumField>
        <div className="flex justify-end pt-1">
          <Button
            type="button"
            size="lg"
            disabled={interactionLocked || !canAddSection}
            onClick={() => void createSection()}
          >
            <Plus className="size-4" aria-hidden />
            Add section
          </Button>
        </div>
      </NewSectionCard>
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
  sectionRef?: (el: HTMLDivElement | null) => void;
}) {
  const { id, disabled, isExpanded, onToggle, titleRow, children, sectionRef } = props;
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
      ref={(el) => {
        setNodeRef(el);
        sectionRef?.(el);
      }}
      style={style}
      className={cn(
        "mb-6 overflow-hidden rounded-xl border border-[#c3c9cf] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow",
        isExpanded && "shadow-[0_4px_16px_rgba(0,0,0,0.1)] ring-1 ring-primary/10",
      )}
      {...attributes}
    >
      <div
        className={cn(
          "flex cursor-pointer select-none items-center gap-2 px-4 py-4 transition-colors sm:px-5",
          isExpanded
            ? "border-b-2 border-primary/20 bg-gradient-to-r from-primary/[0.06] to-[#f7f9fa]"
            : "bg-[#f7f9fa] hover:bg-[#eceff1]",
        )}
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "Collapse section" : "Expand section"}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <SimpleTooltip content="Drag to reorder" side="right">
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...listeners}
            disabled={disabled}
            aria-label="Drag to reorder section"
            className="inline-flex size-8 shrink-0 touch-none cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="size-4" />
          </button>
        </SimpleTooltip>
        {titleRow}
      </div>
      {isExpanded ? (
        <div className="space-y-5 bg-[#eef1f3]/40 px-3 py-4 sm:px-4 sm:py-5">{children}</div>
      ) : null}
    </div>
  );
}
