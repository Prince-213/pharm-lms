const STORAGE_KEY = "pharm-lms:mentor-new-course-draft";

export type MentorNewCourseDraft = {
  courseType?: string;
  title?: string;
  category?: string;
  timeCommitment?: string;
};

export function readMentorNewCourseDraft(): MentorNewCourseDraft {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as MentorNewCourseDraft;
  } catch {
    return {};
  }
}

export function writeMentorNewCourseDraft(draft: MentorNewCourseDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function mergeMentorNewCourseDraft(partial: Partial<MentorNewCourseDraft>) {
  writeMentorNewCourseDraft({ ...readMentorNewCourseDraft(), ...partial });
}

export function clearMentorNewCourseDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
