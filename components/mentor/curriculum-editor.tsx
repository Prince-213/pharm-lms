"use client";

import { Check, Pencil, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Lesson = {
  id: string;
  title: string;
  videoUrl: string | null;
  content: string | null;
};

type SectionQuiz = {
  id: string;
  title: string;
};

type SectionAssignment = {
  id: string;
  title: string;
  status: string;
};

type Section = {
  id: string;
  title: string;
  description: string | null;
  lessons: Lesson[];
  quizzes: SectionQuiz[];
  assignmentItems: SectionAssignment[];
};

type CurriculumResponse = {
  sections: Section[];
};

export function CurriculumEditor({ courseId }: { courseId: string }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionObjective, setNewSectionObjective] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");

  const [activeSectionForLesson, setActiveSectionForLesson] = useState<
    string | null
  >(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonType, setNewLessonType] = useState<"VIDEO" | "ARTICLE">(
    "VIDEO",
  );

  const [activeSectionForItem, setActiveSectionForItem] = useState<
    string | null
  >(null);
  const [itemType, setItemType] = useState<"QUIZ" | "ASSIGNMENT">("QUIZ");
  const [itemTitle, setItemTitle] = useState("");

  const canAddSection = useMemo(
    () => newSectionTitle.trim().length >= 3,
    [newSectionTitle],
  );
  const canAddItem = useMemo(() => itemTitle.trim().length >= 2, [itemTitle]);

  const loadCurriculum = useCallback(
    async (withLoadingState = false) => {
      if (withLoadingState) setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/tutor/courses/${courseId}/curriculum`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        const maybeJson = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        if (withLoadingState) setLoading(false);
        setError(
          maybeJson?.error
            ? `Unable to load curriculum: ${maybeJson.error}`
            : "Unable to load curriculum right now.",
        );
        return;
      }

      const data = (await response.json()) as CurriculumResponse;
      setSections(data.sections);
      if (withLoadingState) setLoading(false);
    },
    [courseId],
  );

  useEffect(() => {
    void loadCurriculum(true);
  }, [loadCurriculum]);

  async function createSection() {
    if (!canAddSection) return;
    setSaving(true);
    const response = await fetch(`/api/tutor/courses/${courseId}/curriculum`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newSectionTitle.trim(),
        objective: newSectionObjective.trim(),
      }),
    });
    if (!response.ok) {
      setSaving(false);
      return;
    }
    setNewSectionTitle("");
    setNewSectionObjective("");
    await loadCurriculum();
    setSaving(false);
  }

  async function updateSectionTitle(sectionId: string, title: string) {
    if (!title.trim()) return;
    setSaving(true);
    await fetch(`/api/tutor/courses/${courseId}/sections/${sectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    setEditingSectionId(null);
    setEditingSectionTitle("");
    await loadCurriculum();
    setSaving(false);
  }

  async function deleteSection(sectionId: string) {
    setSaving(true);
    await fetch(`/api/tutor/courses/${courseId}/sections/${sectionId}`, {
      method: "DELETE",
    });
    await loadCurriculum();
    setSaving(false);
  }

  async function addLesson(sectionId: string, lessonType: "VIDEO" | "ARTICLE") {
    setSaving(true);
    await fetch(
      `/api/tutor/courses/${courseId}/sections/${sectionId}/lessons`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newLessonTitle.trim() || "New lecture",
          contentType: lessonType,
          value: "",
        }),
      },
    );
    setActiveSectionForLesson(null);
    setNewLessonTitle("");
    setNewLessonType("VIDEO");
    await loadCurriculum();
    setSaving(false);
  }

  async function updateLesson(
    sectionId: string,
    lessonId: string,
    payload: {
      title?: string;
      contentType?: "VIDEO" | "ARTICLE";
      value?: string;
    },
  ) {
    setSaving(true);
    await fetch(
      `/api/tutor/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    await loadCurriculum();
    setSaving(false);
  }

  async function addCurriculumItem(sectionId: string) {
    if (!canAddItem) return;
    setSaving(true);
    const response = await fetch(
      `/api/tutor/courses/${courseId}/sections/${sectionId}/items`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType,
          title: itemTitle.trim(),
        }),
      },
    );
    if (!response.ok) {
      setSaving(false);
      return;
    }
    setItemTitle("");
    setItemType("QUIZ");
    setActiveSectionForItem(null);
    await loadCurriculum();
    setSaving(false);
  }

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading curriculum...</p>;
  }

  if (error) {
    return <p className="p-6 text-sm text-[#b32d0f]">{error}</p>;
  }

  return (
    <div className="space-y-5 px-6 py-5">
      <div className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm">
        Here&apos;s where you add real course content: sections, lectures,
        quizzes, and assignments.
      </div>
      {saving ? (
        <p className="text-xs text-muted-foreground">Saving changes...</p>
      ) : null}

      {sections.map((section, sectionIndex) => (
        <div key={section.id} className="border border-[var(--border)] bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-base font-bold">{`Section ${sectionIndex + 1}:`}</span>
            {editingSectionId === section.id ? (
              <>
                <input
                  value={editingSectionTitle}
                  onChange={(event) =>
                    setEditingSectionTitle(event.target.value)
                  }
                  className="w-full max-w-[500px] border border-[var(--border)] px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  className="rounded border border-[var(--border)] p-1 text-[var(--foreground)]"
                  onClick={() =>
                    void updateSectionTitle(
                      section.id,
                      editingSectionTitle.trim(),
                    )
                  }
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded border border-[var(--border)] p-1 text-[var(--foreground)]"
                  onClick={() => {
                    setEditingSectionId(null);
                    setEditingSectionTitle("");
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <p className="w-full max-w-[500px] text-sm">{section.title}</p>
                <button
                  type="button"
                  className="rounded border border-[var(--border)] p-1 text-[var(--foreground)]"
                  onClick={() => {
                    setEditingSectionId(section.id);
                    setEditingSectionTitle(section.title);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded border border-[var(--border)] p-1 text-[var(--foreground)]"
                  onClick={() => {
                    if (
                      window.confirm("Delete this section and its lectures?")
                    ) {
                      void deleteSection(section.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          <div className="space-y-3">
            {section.lessons.map((lesson) => {
              const lessonType: "VIDEO" | "ARTICLE" = lesson.videoUrl
                ? "VIDEO"
                : "ARTICLE";
              const lessonValue = lesson.videoUrl ?? lesson.content ?? "";

              return (
                <div
                  key={lesson.id}
                  className="border border-[var(--border)] bg-[var(--surface-muted)] p-3"
                >
                  <div className="grid gap-2 md:grid-cols-[1fr_180px]">
                    <input
                      defaultValue={lesson.title}
                      onBlur={(event) =>
                        void updateLesson(section.id, lesson.id, {
                          title: event.target.value,
                        })
                      }
                      className="border border-[var(--border)] px-2 py-1 text-sm"
                    />
                    <select
                      defaultValue={lessonType}
                      onChange={(event) =>
                        void updateLesson(section.id, lesson.id, {
                          contentType: event.target.value as
                            | "VIDEO"
                            | "ARTICLE",
                          value: lessonValue,
                        })
                      }
                      className="border border-[var(--border)] px-2 py-1 text-sm"
                    >
                      <option value="VIDEO">Video</option>
                      <option value="ARTICLE">Article</option>
                    </select>
                  </div>
                  <textarea
                    defaultValue={lessonValue}
                    onBlur={(event) =>
                      void updateLesson(section.id, lesson.id, {
                        contentType: lessonType,
                        value: event.target.value,
                      })
                    }
                    placeholder={
                      lessonType === "VIDEO"
                        ? "Paste video URL"
                        : "Write article content for this lecture"
                    }
                    className="mt-2 min-h-20 w-full border border-[var(--border)] px-2 py-1 text-sm"
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSectionForLesson(section.id)}
              className="rounded border border-[var(--primary)] px-3 py-1 text-xs text-[var(--primary)]"
            >
              + Add content
            </button>
            <button
              type="button"
              onClick={() => setActiveSectionForItem(section.id)}
              className="rounded border border-[var(--primary)] px-3 py-1 text-xs text-[var(--primary)]"
            >
              + Curriculum item
            </button>
          </div>

          {activeSectionForLesson === section.id ? (
            <div className="mt-3 grid gap-2 rounded border border-[var(--border)] p-3 md:grid-cols-[1fr_140px_auto]">
              <input
                value={newLessonTitle}
                onChange={(event) => setNewLessonTitle(event.target.value)}
                placeholder="Lecture title"
                className="border border-[var(--border)] px-2 py-1 text-sm"
              />
              <select
                value={newLessonType}
                onChange={(event) =>
                  setNewLessonType(event.target.value as "VIDEO" | "ARTICLE")
                }
                className="border border-[var(--border)] px-2 py-1 text-sm"
              >
                <option value="VIDEO">Video</option>
                <option value="ARTICLE">Article</option>
              </select>
              <button
                type="button"
                onClick={() => void addLesson(section.id, newLessonType)}
                className="rounded bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white"
              >
                Add
              </button>
            </div>
          ) : null}

          {section.quizzes.length > 0 || section.assignmentItems.length > 0 ? (
            <div className="mt-3 space-y-1 text-xs text-[#3e4143]">
              {section.quizzes.map((quiz) => (
                <p key={quiz.id}>{`Quiz: ${quiz.title}`}</p>
              ))}
              {section.assignmentItems.map((assignment) => (
                <p
                  key={assignment.id}
                >{`Assignment: ${assignment.title} (${assignment.status})`}</p>
              ))}
            </div>
          ) : null}

          {activeSectionForItem === section.id ? (
            <div className="mt-3 grid gap-2 rounded border border-[var(--border)] p-3 md:grid-cols-[140px_1fr_auto]">
              <select
                value={itemType}
                onChange={(event) =>
                  setItemType(event.target.value as "QUIZ" | "ASSIGNMENT")
                }
                className="border border-[var(--border)] px-2 py-1 text-sm"
              >
                <option value="QUIZ">Quiz</option>
                <option value="ASSIGNMENT">Assignment</option>
              </select>
              <input
                value={itemTitle}
                onChange={(event) => setItemTitle(event.target.value)}
                placeholder="Title"
                className="border border-[var(--border)] px-2 py-1 text-sm"
              />
              <button
                type="button"
                disabled={!canAddItem}
                onClick={() => void addCurriculumItem(section.id)}
                className="rounded bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
              >
                Add
              </button>
            </div>
          ) : null}
        </div>
      ))}

      <div className="border border-[var(--border)] bg-white p-4">
        <h3 className="mb-2 text-base font-bold">New Section</h3>
        <div className="grid gap-2">
          <input
            value={newSectionTitle}
            onChange={(event) => setNewSectionTitle(event.target.value)}
            maxLength={120}
            placeholder="Enter section title"
            className="border border-[var(--border)] px-2 py-2 text-sm"
          />
          <input
            value={newSectionObjective}
            onChange={(event) => setNewSectionObjective(event.target.value)}
            maxLength={500}
            placeholder="Enter a learning objective"
            className="border border-[var(--border)] px-2 py-2 text-sm"
          />
          <button
            type="button"
            disabled={!canAddSection}
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
