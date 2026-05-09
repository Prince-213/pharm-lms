"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
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
import { FileUploader } from "@/components/upload/file-uploader";
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

  // ── Lesson form ───────────────────────────────────────────────────────────
  const [activeSectionForLesson, setActiveSectionForLesson] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonType, setNewLessonType] = useState<"VIDEO" | "ARTICLE">("VIDEO");
  const [newLessonArticleContent, setNewLessonArticleContent] = useState("");
  const [newLessonVideoFile, setNewLessonVideoFile] = useState<File | null>(null);

  // ── Curriculum item form ──────────────────────────────────────────────────
  const [activeSectionForItem, setActiveSectionForItem] = useState<string | null>(null);
  const [itemType, setItemType] = useState<"QUIZ" | "ASSIGNMENT">("QUIZ");
  const [itemTitle, setItemTitle] = useState("");
  const [quizQuestionsText, setQuizQuestionsText] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentDueDays, setAssignmentDueDays] = useState("7");

  // ── Resource form ─────────────────────────────────────────────────────────
  const [activeSectionForResource, setActiveSectionForResource] = useState<string | null>(null);
  const [resourceType, setResourceType] = useState<"LINK" | "FILE">("LINK");
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [resourceUploading, setResourceUploading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // ─────────────────────────────────────────────────────────────────────────

  const canAddSection = useMemo(() => newSectionTitle.trim().length >= 3, [newSectionTitle]);
  const canAddItem = useMemo(() => itemTitle.trim().length >= 2, [itemTitle]);
  const canAddResource = useMemo(
    () =>
      resourceTitle.trim().length >= 2 &&
      (resourceType === "FILE" ? Boolean(resourceFile) : resourceUrl.trim().length >= 4),
    [resourceTitle, resourceType, resourceFile, resourceUrl],
  );

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
    const res = await fetch(`/api/mentor/courses/${courseId}/curriculum`, { method: "GET", cache: "no-store" });
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
      const res = await fetch(`/api/mentor/courses/${courseId}/sections/${sectionId}`, {
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
      fetch(`/api/mentor/courses/${courseId}/upload`, { method: "POST", body: formData }),
    );
    if (!res.ok) return null;
    return (await res.json()) as { url: string };
  }

  async function uploadResourceFile(file: File) {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("purpose", "resource-file");
    const res = await fetch(`/api/mentor/courses/${courseId}/upload`, { method: "POST", body: formData });
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
      fetch(`/api/mentor/courses/${courseId}/curriculum`, {
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
      fetch(`/api/mentor/courses/${courseId}/sections/${sectionId}`, {
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
      fetch(`/api/mentor/courses/${courseId}/sections/${sectionId}`, { method: "DELETE" }),
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
      setActiveSectionForLesson(null);
      setNewLessonTitle("");
      setNewLessonType("VIDEO");
      setNewLessonArticleContent("");

      const res = await fetch(
        `/api/mentor/courses/${courseId}/sections/${sectionId}/lessons`,
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
      setActiveSectionForLesson(null);
      setNewLessonTitle("");
      setNewLessonType("VIDEO");

      const res = await fetch(
        `/api/mentor/courses/${courseId}/sections/${sectionId}/lessons`,
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
      fetch(`/api/mentor/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`, {
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
        const res = await fetch(`/api/mentor/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`, {
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
    const tempId = crypto.randomUUID();
    const quizQuestions = quizQuestionsText.split("\n").map((q) => q.trim()).filter(Boolean);
    
    // Optimistic UI
    const tempItem = {
      id: tempId,
      title: itemTitle.trim(),
      status: "DRAFT",
    };

    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        if (itemType === "QUIZ") return { ...s, quizzes: [...s.quizzes, { id: tempId, title: tempItem.title }] };
        return { ...s, assignmentItems: [...s.assignmentItems, tempItem as SectionAssignment] };
      })
    );

    setItemTitle("");
    setItemType("QUIZ");
    setQuizQuestionsText("");
    setAssignmentDescription("");
    setAssignmentDueDays("7");
    setActiveSectionForItem(null);

    const res = await runPending(() =>
      fetch(`/api/mentor/courses/${courseId}/sections/${sectionId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType,
          title: tempItem.title,
          quizQuestions: itemType === "QUIZ" ? quizQuestions : undefined,
          assignmentDescription: itemType === "ASSIGNMENT" ? assignmentDescription : undefined,
          dueDays: itemType === "ASSIGNMENT" ? Number(assignmentDueDays || "7") : undefined,
        }),
      }),
    );
    if (!res.ok) {
      toast.error("Could not add curriculum item.");
      // Rollback
      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== sectionId) return s;
          if (itemType === "QUIZ") return { ...s, quizzes: s.quizzes.filter(q => q.id !== tempId) };
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
    let uploadedMsgId: string | number | undefined;
    
    try {
      let url = resourceUrl.trim();
      if (resourceType === "FILE") {
        if (!resourceFile) return;
        uploadedMsgId = toast.loading("Uploading file...");
        const uploaded = await uploadResourceFile(resourceFile);
        if (!uploaded) { 
          toast.error("File upload failed.", { id: uploadedMsgId }); 
          return; 
        }
        toast.dismiss(uploadedMsgId);
        url = uploaded.url;
      }
      
      const newResource: SectionResource = {
        id: crypto.randomUUID(),
        type: resourceType,
        title: resourceTitle.trim(),
        url,
      };
      
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return;
      
      const oldSections = [...sections];
      const updatedResources = [...section.resources, newResource];
      
      // Optimistic update
      setSections((prev) => patchSectionDescription(prev, sectionId, updatedResources));
      setResourceTitle("");
      setResourceUrl("");
      setResourceFile(null);
      setResourceType("LINK");
      setActiveSectionForResource(null);
      
      toast.promise(pushResources(sectionId, updatedResources), {
        loading: 'Attaching resource...',
        success: 'Resource attached',
        error: () => {
          setSections(oldSections);
          return 'Failed to attach resource';
        }
      });
    } finally {
      if (uploadedMsgId) toast.dismiss(uploadedMsgId);
      setResourceUploading(false);
    }
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
            fetch(`/api/mentor/courses/${courseId}/sections/${s.id}`, {
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

  if (loading) return <p className="p-6 text-sm text-[#6a6f73]">Loading curriculum...</p>;
  if (error) return <p className="p-6 text-sm text-[#b32d0f]">{error}</p>;

  return (
    <div className="space-y-5 px-6 py-5">
      {readOnly ? (
        <p className="rounded border border-[#d1d7dc] bg-[#f6f7f9] p-3 text-sm text-[#6a6f73]">
          This course is pending review. Curriculum is read-only.
        </p>
      ) : null}
      <div className="rounded border border-[#d1d7dc] bg-[#f6f7f9] p-4 text-sm">
        Manage content by type: video uploads, article text, quiz questions,
        assignment instructions, and section resources.
      </div>
      {saving ? <p className="text-xs text-[#6a6f73]">Saving...</p> : null}

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
                     <span className="shrink-0 text-sm font-bold text-[#1c1d1f]">{`Section ${sectionIndex + 1} : `}</span>
                    {editingSectionId === section.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={editingSectionTitle}
                          onChange={(e) => setEditingSectionTitle(e.target.value)}
                          disabled={interactionLocked}
                          autoFocus
                          className="min-w-0 flex-1 max-w-[300px] border border-[#d1d7dc] px-2 py-1 text-sm rounded"
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
                       <p className="truncate text-sm font-semibold text-[#1c1d1f]">
                        {section.title}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {!editingSectionId && (
                       <button
                       type="button"
                       disabled={interactionLocked}
                       onClick={(e) => {
                         e.stopPropagation();
                         setEditingSectionId(section.id);
                         setEditingSectionTitle(section.title);
                       }}
                       className="rounded p-1 text-[#6a6f73] hover:bg-[#f6f7f9]"
                     >
                       <Pencil className="h-4 w-4" />
                     </button>
                    )}
                    <button
                      type="button"
                      disabled={interactionLocked}
                      onClick={(e) => {
                        e.stopPropagation();
                        void deleteSection(section.id);
                      }}
                      className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="h-4 w-px bg-gray-200 mx-1" />
                    {expandedSections.has(section.id) ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              }
            >
              {/* ── Lessons ─────────────────────────────────────────────── */}
              <div className="space-y-4">
                {section.lessons.map((lesson) => {
                  const lessonType: "VIDEO" | "ARTICLE" =
                    lesson.content === null ? "VIDEO" : "ARTICLE";
                  return (
                    <div
                      key={lesson.id}
                      className="group border border-[#d1d7dc] bg-white p-4 rounded-md shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                           <div className="bg-gray-50 p-2 rounded shrink-0">
                            {lessonType === "VIDEO" ? <FileVideo className="h-4 w-4 text-purple-600" /> : <FileText className="h-4 w-4 text-emerald-600" />}
                          </div>
                          <input
                            defaultValue={lesson.title}
                            disabled={interactionLocked}
                            onBlur={(e) =>
                              queueLessonPatch(section.id, lesson.id, {
                                title: e.target.value,
                              })
                            }
                            className="w-full border-none focus:ring-0 text-sm font-medium bg-transparent overflow-hidden text-ellipsis"
                          />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
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
                            className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs font-medium text-gray-600 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                          >
                            <option value="VIDEO">Video</option>
                            <option value="ARTICLE">Article</option>
                          </select>
                          <button
                            type="button"
                            disabled={interactionLocked}
                            onClick={() => void deleteLesson(section.id, lesson.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete lesson"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {lessonType === "ARTICLE" ? (
                        <div className="mt-2 pl-10 border-l-2 border-emerald-100">
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
                        </div>
                      ) : (
                        <div className="mt-2 pl-10 border-l-2 border-purple-100">
                          <FileUploader
                            purpose="lesson-video"
                            courseId={courseId}
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
                                      l.id === lesson.id ? { ...l, videoUrl: null } : l
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
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Resources list ───────────────────────────────────────── */}
              {section.resources.length > 0 && (
                <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Section Resources
                  </p>
                  <ul className="space-y-1.5">
                    {section.resources.map((resource) => (
                      <li
                        key={resource.id}
                        className="flex items-center gap-2 text-xs"
                      >
                        {resource.type === "LINK" ? (
                          <Link2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        ) : (
                          <FileText className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        )}
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 truncate font-medium text-emerald-800 hover:underline"
                        >
                          {resource.title}
                        </a>
                        <ExternalLink className="h-3 w-3 text-emerald-400" />
                        {!interactionLocked && (
                          <button
                            type="button"
                            onClick={() =>
                              void removeResource(section.id, resource.id)
                            }
                            className="ml-1 rounded p-0.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                            aria-label="Remove resource"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── Curriculum items list ────────────────────────────────── */}
              {(section.quizzes.length > 0 ||
                section.assignmentItems.length > 0) && (
                <div className="mt-3 rounded border border-[#d1d7dc] bg-[#f6f7f9] p-3 text-xs">
                  <p className="mb-2 font-semibold text-[#1c1d1f]">
                    Curriculum items
                  </p>
                  <div className="space-y-1">
                    {section.quizzes.map((quiz) => (
                      <p key={quiz.id}>{`Quiz: ${quiz.title}`}</p>
                    ))}
                    {section.assignmentItems.map((a) => (
                      <p key={a.id}>{`Assignment: ${a.title}`}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Action buttons ───────────────────────────────────────── */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={interactionLocked}
                  onClick={() => {
                    setActiveSectionForLesson(section.id);
                    setNewLessonType(suggestContentType(section.title));
                  }}
                  className="rounded border border-[var(--primary)] px-3 py-1 text-xs text-[var(--primary)] disabled:opacity-50"
                >
                  + Add content
                </button>
                <button
                  type="button"
                  disabled={interactionLocked}
                  onClick={() => setActiveSectionForItem(section.id)}
                  className="rounded border border-[var(--primary)] px-3 py-1 text-xs text-[var(--primary)] disabled:opacity-50"
                >
                  + Curriculum item
                </button>
                <button
                  type="button"
                  disabled={interactionLocked}
                  onClick={() => {
                    setActiveSectionForResource(section.id);
                    setResourceType("LINK");
                    setResourceTitle("");
                    setResourceUrl("");
                    setResourceFile(null);
                  }}
                  className="rounded border border-emerald-600 px-3 py-1 text-xs text-emerald-700 disabled:opacity-50"
                >
                  + Add resource
                </button>
              </div>

              {/* ── Add lesson form ──────────────────────────────────────── */}
              {activeSectionForLesson === section.id ? (
                <div className="mt-3 rounded border border-[#d1d7dc] p-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                    <input
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      disabled={interactionLocked}
                      placeholder="Lecture title"
                      className="border border-[#d1d7dc] px-2 py-1 text-sm disabled:bg-[#f6f7f9]"
                    />
                    <select
                      value={newLessonType}
                      disabled={interactionLocked}
                      onChange={(e) =>
                        setNewLessonType(e.target.value as "VIDEO" | "ARTICLE")
                      }
                      className="border border-[#d1d7dc] px-2 py-1 text-sm disabled:bg-[#f6f7f9]"
                    >
                      <option value="VIDEO">Video</option>
                      <option value="ARTICLE">Article</option>
                    </select>
                  </div>
                  {newLessonType === "ARTICLE" ? (
                    <div className="mt-3">
                      <RichTextArea
                        value={newLessonArticleContent}
                        onChange={setNewLessonArticleContent}
                        disabled={interactionLocked}
                        placeholder="Article content"
                        minHeightClass="min-h-[120px]"
                      />
                    </div>
                  ) : (
                    <div className="mt-3">
                      <FileUploader
                        purpose="lesson-video"
                        courseId={courseId}
                        disabled={interactionLocked}
                        onUploadComplete={(url) => {
                          setNewLessonVideoFile(null);
                          void addLessonWithVideo(section.id, url);
                        }}
                        showPreview={false}
                      />
                    </div>
                  )}
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      disabled={interactionLocked}
                      onClick={() => {
                        setActiveSectionForLesson(null);
                        setNewLessonTitle("");
                        setNewLessonType("VIDEO");
                        setNewLessonArticleContent("");
                        setNewLessonVideoFile(null);
                      }}
                      className="rounded border border-[#d1d7dc] px-3 py-1 text-xs text-[#6a6f73]"
                    >
                      Cancel
                    </button>
                    {newLessonType === "ARTICLE" && (
                      <button
                        type="button"
                        disabled={interactionLocked || !newLessonArticleContent.trim()}
                        onClick={() => void addLessonWithContent(section.id)}
                        className="ml-2 rounded bg-[var(--primary)] px-4 py-1 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Add Lesson
                      </button>
                    )}
                  </div>
                </div>
              ) : null}

              {/* ── Add curriculum item form ─────────────────────────────── */}
              {activeSectionForItem === section.id ? (
                <div className="mt-3 grid gap-2 rounded border border-[#d1d7dc] p-3 md:grid-cols-[140px_1fr_auto]">
                  <select
                    value={itemType}
                    disabled={interactionLocked}
                    onChange={(e) =>
                      setItemType(e.target.value as "QUIZ" | "ASSIGNMENT")
                    }
                    className="border border-[#d1d7dc] px-2 py-1 text-sm disabled:bg-[#f6f7f9]"
                  >
                    <option value="QUIZ">Quiz</option>
                    <option value="ASSIGNMENT">Assignment</option>
                  </select>
                  <input
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    disabled={interactionLocked}
                    placeholder="Title"
                    className="border border-[#d1d7dc] px-2 py-1 text-sm disabled:bg-[#f6f7f9]"
                  />
                  <button
                    type="button"
                    disabled={interactionLocked || !canAddItem}
                    onClick={() => void addItem(section.id)}
                    className="rounded bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Add
                  </button>
                  {itemType === "QUIZ" ? (
                    <textarea
                      value={quizQuestionsText}
                      onChange={(e) => setQuizQuestionsText(e.target.value)}
                      disabled={interactionLocked}
                      placeholder="Format: Question || Answer OR [Question] Answer (one per line)"
                      className="md:col-span-3 min-h-20 border border-[#d1d7dc] px-2 py-1 text-sm disabled:bg-[#f6f7f9]"
                    />
                  ) : (
                    <>
                      <div className="md:col-span-3">
                        <RichTextArea
                          value={assignmentDescription}
                          onChange={setAssignmentDescription}
                          disabled={interactionLocked}
                          placeholder="Assignment instructions"
                          minHeightClass="min-h-[100px]"
                        />
                      </div>
                      <input
                        value={assignmentDueDays}
                        onChange={(e) => setAssignmentDueDays(e.target.value)}
                        disabled={interactionLocked}
                        placeholder="Due in days (e.g. 7)"
                        className="md:col-span-3 border border-[#d1d7dc] px-2 py-1 text-sm disabled:bg-[#f6f7f9]"
                      />
                    </>
                  )}
                </div>
              ) : null}

              {/* ── Add resource form ────────────────────────────────────── */}
              {activeSectionForResource === section.id ? (
                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-bold text-emerald-800">
                      Add Section Resource
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveSectionForResource(null)}
                      className="rounded p-1 text-emerald-600 hover:bg-emerald-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                    {/* Type selector */}
                    <div className="flex gap-2 sm:flex-col sm:gap-1.5">
                      <button
                        type="button"
                        onClick={() => setResourceType("LINK")}
                        className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold transition ${
                          resourceType === "LINK"
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        <Link2 className="h-3.5 w-3.5" /> Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setResourceType("FILE")}
                        className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold transition ${
                          resourceType === "FILE"
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        <Upload className="h-3.5 w-3.5" /> File
                      </button>
                    </div>
                    {/* Input area */}
                    <div className="space-y-2">
                      <input
                        value={resourceTitle}
                        onChange={(e) => setResourceTitle(e.target.value)}
                        placeholder="Resource title (e.g. Study Guide)"
                        className="w-full rounded border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      {resourceType === "LINK" ? (
                        <input
                          value={resourceUrl}
                          onChange={(e) => setResourceUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full rounded border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      ) : (
                        <>
                          <input
                            type="file"
                            onChange={(e) =>
                              setResourceFile(e.target.files?.[0] ?? null)
                            }
                            className="w-full rounded border border-emerald-200 bg-white px-3 py-2 text-sm"
                          />
                          {resourceFile && (
                            <p className="text-xs text-emerald-700">
                              Selected: {resourceFile.name} (
                              {(resourceFile.size / 1024).toFixed(1)} KB)
                            </p>
                          )}
                        </>
                      )}
                      <button
                        type="button"
                        disabled={
                          !canAddResource ||
                          resourceUploading ||
                          interactionLocked
                        }
                        onClick={() => void addResource(section.id)}
                        className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {resourceUploading ? "Uploading…" : "Add Resource"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </SortableSection>
          ))}
        </SortableContext>
      </DndContext>

      {/* ── New section form ─────────────────────────────────────────────── */}
      <div className="border border-[#d1d7dc] bg-white p-4">
        <h3 className="mb-2 text-base font-bold">New Section</h3>
        <div className="grid gap-2">
          <input
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            maxLength={120}
            disabled={interactionLocked}
            placeholder="Enter section title"
            className="border border-[#d1d7dc] px-2 py-2 text-sm disabled:bg-[#f6f7f9]"
          />
          <input
            value={newSectionObjective}
            onChange={(e) => setNewSectionObjective(e.target.value)}
            maxLength={500}
            disabled={interactionLocked}
            placeholder="Enter a learning objective"
            className="border border-[#d1d7dc] px-2 py-2 text-sm disabled:bg-[#f6f7f9]"
          />
          <button
            type="button"
            disabled={interactionLocked || !canAddSection}
            onClick={() => void createSection()}
            className="ml-auto rounded bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Add Section
          </button>
        </div>
      </div>
    </div>
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
      className={`border border-[#d1d7dc] bg-white transition-all ${
        isExpanded ? "mb-6 shadow-sm" : "mb-2"
      }`}
      {...attributes}
    >
      <div
        className={`flex items-center gap-2 p-3 cursor-pointer select-none transition-colors ${
          isExpanded ? "bg-gray-50/50 border-b border-gray-100" : "hover:bg-gray-50"
        }`}
        onClick={onToggle}
      >
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...listeners}
          disabled={disabled}
          aria-label="Reorder section"
          className="shrink-0 touch-none cursor-grab rounded p-1 text-[#6a6f73] hover:bg-[#f6f7f9] disabled:cursor-not-allowed disabled:opacity-40"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        {titleRow}
      </div>
      {isExpanded && <div className="p-4 bg-white animate-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
  );
}
