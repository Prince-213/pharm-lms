import { revalidatePath } from "next/cache";

/** Invalidate student-facing catalog and learning surfaces. */
export function revalidateStudentPortal(courseId?: string) {
  revalidatePath("/student/dashboard");
  revalidatePath("/student/courses");
  revalidatePath("/student/browse");
  revalidatePath("/student/wishlist");
  revalidatePath("/student/assignments");
  revalidatePath("/student/messages");
  revalidatePath("/student/meetings");
  revalidatePath("/student/achievements");
  if (courseId) {
    revalidatePath(`/student/browse/${courseId}`);
    revalidatePath(`/student/course/${courseId}`);
  }
}

/** Invalidate tutor studio and performance surfaces. */
export function revalidateTutorPortal(courseId?: string) {
  revalidatePath("/tutor/courses");
  revalidatePath("/tutor/assignments");
  revalidatePath("/tutor/performance");
  revalidatePath("/tutor/communication/messages");
  revalidatePath("/tutor/communication/announcements");
  revalidatePath("/tutor/communication/meetings");
  if (courseId) {
    revalidatePath(`/tutor/courses/${courseId}/overview`);
    revalidatePath(`/tutor/courses/${courseId}/preview`);
    revalidatePath(`/tutor/courses/${courseId}/manage/basics`);
    revalidatePath(`/tutor/courses/${courseId}/manage/curriculum`);
    revalidatePath(`/tutor/courses/${courseId}/manage/pricing`);
    revalidatePath(`/tutor/courses/${courseId}/manage/messages`);
    revalidatePath(`/tutor/courses/${courseId}/manage/film`);
  }
}

/** Invalidate admin CRM and approval queues. */
export function revalidateAdminPortal(courseId?: string) {
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/course-approvals");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/messages");
  revalidatePath("/admin/mentor-applications");
  revalidatePath("/admin/students");
  revalidatePath("/admin/tutors");
  revalidatePath("/admin/mentors");
  if (courseId) {
    revalidatePath(`/admin/courses/${courseId}/overview`);
  }
}

/** Invalidate mentor dashboard surfaces. */
export function revalidateMentorPortal() {
  revalidatePath("/mentor/dashboard");
  revalidatePath("/mentor/profile");
  revalidatePath("/mentor/meetings");
}

export function revalidateMessaging() {
  revalidatePath("/student/messages");
  revalidatePath("/tutor/communication/messages");
  revalidatePath("/admin/messages");
}

/** Call after any course content or metadata mutation. */
export function revalidateCourseSurfaces(courseId: string) {
  revalidateStudentPortal(courseId);
  revalidateTutorPortal(courseId);
  revalidateAdminPortal(courseId);
  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
}
