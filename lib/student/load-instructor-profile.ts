import {
  CourseStatus,
  MeetingRequestStatus,
  MeetingStatus,
  MentorProfileStatus,
  UserRole,
} from "@/generated/prisma/enums";
import {
  getStudentPricingContext,
  mapCoursesWithDisplayPrices,
} from "@/lib/currency/student-pricing-context";
import { db } from "@/lib/db";

export type InstructorAvailabilitySlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string | null;
};

export type TutorCourseCard = {
  id: string;
  title: string;
  subtitle: string | null;
  thumbnailUrl: string | null;
  priceMinorUnits: number | null;
  priceCurrency: string;
  learnerCount: number;
  isEnrolled: boolean;
};

export type TutorProfileData = {
  kind: "tutor";
  id: string;
  fullName: string;
  bio: string | null;
  avatarUrl: string | null;
  headline: string | null;
  specialties: string[];
  createdAt: Date;
  availability: InstructorAvailabilitySlot[];
  stats: {
    learnersReached: number;
    publishedCourses: number;
    avgRating: number | null;
    reviewCount: number;
  };
  enrolledCourses: TutorCourseCard[];
  publishedCourses: TutorCourseCard[];
};

export type MentorProfileData = {
  kind: "mentor";
  id: string;
  fullName: string;
  bio: string | null;
  avatarUrl: string | null;
  headline: string | null;
  specialties: string[];
  yearsExperience: number | null;
  createdAt: Date;
  availability: InstructorAvailabilitySlot[];
  stats: {
    studentsMentored: number;
    completedSessions: number;
    avgRating: number | null;
    reviewCount: number;
  };
};

function parseSpecialtyTags(raw: string | null): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function loadTutorProfileForStudent(
  tutorId: string,
  studentId: string,
): Promise<TutorProfileData | null> {
  const tutor = await db.user.findFirst({
    where: {
      id: tutorId,
      role: UserRole.TUTOR,
      isActive: true,
      tutorProfileCompletedAt: { not: null },
    },
    select: {
      id: true,
      fullName: true,
      bio: true,
      avatarUrl: true,
      mentorHeadline: true,
      mentorSpecialties: true,
      createdAt: true,
      availability: {
        where: { isRecurring: true },
        orderBy: { dayOfWeek: "asc" },
        select: {
          dayOfWeek: true,
          startTime: true,
          endTime: true,
          timezone: true,
        },
      },
    },
  });
  if (!tutor) return null;

  const [learnersReached, publishedCourses, enrollments, reviewAgg] =
    await Promise.all([
      db.enrollment.count({ where: { course: { mentorId: tutorId } } }),
      db.course.findMany({
        where: { mentorId: tutorId, status: CourseStatus.PUBLISHED },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          subtitle: true,
          thumbnailUrl: true,
          priceMinorUnits: true,
          priceCurrency: true,
          _count: { select: { enrollments: true } },
        },
      }),
      db.enrollment.findMany({
        where: { studentId, course: { mentorId: tutorId } },
        select: { courseId: true },
      }),
      db.courseReview.aggregate({
        where: { course: { mentorId: tutorId } },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

  const enrolledIds = new Set(enrollments.map((e) => e.courseId));

  const { displayCurrency } = await getStudentPricingContext(studentId);

  const priced = await mapCoursesWithDisplayPrices(
    publishedCourses.map((c) => ({
      ...c,
      priceMinorUnits: c.priceMinorUnits,
    })),
    displayCurrency,
  );

  const toCard = (
    c: (typeof priced)[number],
    isEnrolled: boolean,
  ): TutorCourseCard => ({
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    thumbnailUrl: c.thumbnailUrl,
    priceMinorUnits: c.priceMinorUnits,
    priceCurrency: c.priceCurrency,
    learnerCount: c._count.enrollments,
    isEnrolled,
  });

  const published = priced.map((c) => toCard(c, enrolledIds.has(c.id)));
  const enrolled = published.filter((c) => c.isEnrolled);

  const reviewCount = reviewAgg._count;
  const avgRating =
    reviewCount > 0 && reviewAgg._avg.rating != null
      ? Math.round(reviewAgg._avg.rating * 10) / 10
      : null;

  return {
    kind: "tutor",
    id: tutor.id,
    fullName: tutor.fullName,
    bio: tutor.bio,
    avatarUrl: tutor.avatarUrl,
    headline: tutor.mentorHeadline,
    specialties: parseSpecialtyTags(tutor.mentorSpecialties),
    createdAt: tutor.createdAt,
    availability: tutor.availability,
    stats: {
      learnersReached,
      publishedCourses: published.length,
      avgRating,
      reviewCount,
    },
    enrolledCourses: enrolled,
    publishedCourses: published,
  };
}

export async function loadMentorProfileForStudent(
  mentorId: string,
): Promise<MentorProfileData | null> {
  const mentor = await db.user.findFirst({
    where: {
      id: mentorId,
      role: UserRole.MENTOR,
      isActive: true,
      mentorProfileStatus: MentorProfileStatus.APPROVED,
    },
    select: {
      id: true,
      fullName: true,
      bio: true,
      avatarUrl: true,
      mentorHeadline: true,
      mentorSpecialties: true,
      mentorYearsExperience: true,
      createdAt: true,
      availability: {
        where: { isRecurring: true },
        orderBy: { dayOfWeek: "asc" },
        select: {
          dayOfWeek: true,
          startTime: true,
          endTime: true,
          timezone: true,
        },
      },
    },
  });
  if (!mentor) return null;

  const [acceptedRequests, completedSessions] = await Promise.all([
    db.meetingRequest.findMany({
      where: { mentorId, status: MeetingRequestStatus.ACCEPTED },
      select: { studentId: true },
    }),
    db.meeting.count({
      where: { mentorId, status: MeetingStatus.COMPLETED },
    }),
  ]);
  const studentsMentored = new Set(acceptedRequests.map((r) => r.studentId))
    .size;

  return {
    kind: "mentor",
    id: mentor.id,
    fullName: mentor.fullName,
    bio: mentor.bio,
    avatarUrl: mentor.avatarUrl,
    headline: mentor.mentorHeadline,
    specialties: parseSpecialtyTags(mentor.mentorSpecialties),
    yearsExperience: mentor.mentorYearsExperience,
    createdAt: mentor.createdAt,
    availability: mentor.availability,
    stats: {
      studentsMentored,
      completedSessions,
      avgRating: null,
      reviewCount: 0,
    },
  };
}
