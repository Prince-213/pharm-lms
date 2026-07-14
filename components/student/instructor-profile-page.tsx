import Link from "next/link";
import { GraduationCap, Microscope, Sparkles, Target } from "lucide-react";
import { InstructorAvailabilitySection } from "@/components/student/instructor-availability-section";
import { InstructorBookingSidebar } from "@/components/student/instructor-booking-sidebar";
import { InstructorHighlightCards } from "@/components/student/instructor-highlight-cards";
import { InstructorProfileBreadcrumb } from "@/components/student/instructor-profile-breadcrumb";
import { InstructorProfileHeader } from "@/components/student/instructor-profile-header";
import { MentorCoachingSection } from "@/components/student/mentor-coaching-section";
import { StudentSecondaryNav } from "@/components/student/student-secondary-nav";
import { TutorEnrolledCoursesSection } from "@/components/student/tutor-enrolled-courses-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  MentorProfileData,
  TutorCourseCard,
  TutorProfileData,
} from "@/lib/student/load-instructor-profile";

type InstructorProfilePageProps = {
  profile: TutorProfileData | MentorProfileData;
  avatarSrc: string | null;
  enrolledCourses?: TutorCourseCard[];
  publishedCourses?: TutorCourseCard[];
  initialCourseId?: string | null;
  backHref?: string;
  backLabel?: string;
};

export function InstructorProfilePage({
  profile,
  avatarSrc,
  enrolledCourses = [],
  publishedCourses = [],
  initialCourseId = null,
  backHref = "/student/meetings",
  backLabel = "Back to meetings",
}: InstructorProfilePageProps) {
  const isTutor = profile.kind === "tutor";
  const initials = profile.fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const memberYear = new Date(profile.createdAt).getFullYear();
  const availabilityRows = profile.availability.map((a) => ({
    dayOfWeek: a.dayOfWeek,
    startTime: a.startTime,
    endTime: a.endTime,
  }));
  const timezoneLabel =
    profile.availability[0]?.timezone ??
    (isTutor ? "Instructor local time" : "Mentor local time");

  const bioText =
    profile.bio?.trim() ??
    (isTutor
      ? "Your instructor supports structured learning, exam preparation, and practical pharmacy skills."
      : "Book a one-on-one coaching session for personalized guidance on your pharmacy journey.");

  const bioParagraphs = bioText.split(/\n\n+/).filter(Boolean);

  const availabilityRowsForSidebar = availabilityRows;

  if (isTutor) {
    const tutor = profile;
    const teachesLabel =
      tutor.specialties.length > 0
        ? tutor.specialties.slice(0, 4).join(" · ")
        : tutor.stats.publishedCourses > 0
          ? `${tutor.stats.publishedCourses} published course${tutor.stats.publishedCourses === 1 ? "" : "s"}`
          : "Clinical pharmacy";

    const clinicalBlurb =
      bioParagraphs[0] ??
      `Leads instruction with a focus on clear outcomes and practical skills.`;
    const researchBlurb =
      bioParagraphs.slice(1, 3).join(" ").trim() ||
      "Hosts live sessions and keeps material aligned with current practice expectations.";

    return (
      <div className="space-y-6 text-foreground">
        {/* <StudentSecondaryNav /> */}

        <InstructorProfileBreadcrumb
          listHref="/student/tutors"
          listLabel="Tutors"
          name={tutor.fullName}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(100%,20rem)] lg:items-start">
          <div className="space-y-6">
            <InstructorProfileHeader
              badge="Course tutor"
              fullName={tutor.fullName}
              headline={tutor.headline}
              bioPreview={bioText}
              avatarSrc={avatarSrc}
              initials={initials}
              teachesLabel={teachesLabel}
              speaksLabel={
                tutor.stats.avgRating != null
                  ? `${tutor.stats.avgRating} average course rating`
                  : undefined
              }
              stats={[
                {
                  label: "Learners reached",
                  value:
                    tutor.stats.learnersReached >= 1000
                      ? `${Math.floor(tutor.stats.learnersReached / 1000)}k+`
                      : String(tutor.stats.learnersReached),
                },
                {
                  label: "Published courses",
                  value: String(tutor.stats.publishedCourses),
                },
                {
                  label: "Teaching since",
                  value: String(memberYear),
                },
              ]}
            />

            <TutorEnrolledCoursesSection
              tutorName={tutor.fullName}
              enrolledCourses={enrolledCourses}
              publishedCourses={publishedCourses}
            />

            <InstructorAvailabilitySection
              availability={profile.availability}
              timezoneLabel={timezoneLabel}
            />

            <Card className="shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  About
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                {bioParagraphs.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </CardContent>
            </Card>

            <InstructorHighlightCards
              cards={[
                {
                  icon: GraduationCap,
                  title: "Instruction",
                  description: clinicalBlurb,
                },
                {
                  icon: Microscope,
                  title: "Live support",
                  description: researchBlurb,
                },
              ]}
            />
          </div>

          <InstructorBookingSidebar
            hostId={tutor.id}
            hostName={tutor.fullName}
            hostKind="tutor"
            availability={availabilityRowsForSidebar}
            timezoneLabel={timezoneLabel}
            enrolledCourses={enrolledCourses.map((c) => ({
              id: c.id,
              title: c.title,
            }))}
            initialCourseId={initialCourseId}
            avgRating={tutor.stats.avgRating}
            reviewCount={tutor.stats.reviewCount}
          />
        </div>

        <FooterLink href={backHref} label={backLabel} />
      </div>
    );
  }

  const mentor = profile;
  const focusLabel =
    mentor.specialties.length > 0
      ? mentor.specialties.join(" · ")
      : mentor.headline?.trim() || "Coaching & career guidance";

  const coachingBlurb =
    bioParagraphs[0] ??
    "Personalized mentoring for pharmacy students and early-career professionals.";
  const careerBlurb =
    bioParagraphs.slice(1, 3).join(" ").trim() ||
    "Sessions focus on goals, accountability, and practical next steps.";

  const stats: { label: string; value: string }[] = [];
  if (mentor.stats.studentsMentored > 0) {
    stats.push({
      label: "Students mentored",
      value:
        mentor.stats.studentsMentored >= 1000
          ? `${Math.floor(mentor.stats.studentsMentored / 1000)}k+`
          : String(mentor.stats.studentsMentored),
    });
  }
  if (mentor.yearsExperience != null) {
    stats.push({
      label: "Experience",
      value: `${mentor.yearsExperience} yrs`,
    });
  }
  stats.push({
    label: "On PharmLMS since",
    value: String(memberYear),
  });
  if (stats.length < 3) {
    stats.push({
      label: "Session type",
      value: "1-on-1",
    });
  }

  return (
    <div className="space-y-6 text-[var(--foreground)]">
      <StudentSecondaryNav />

      <InstructorProfileBreadcrumb
        listHref="/student/mentors"
        listLabel="Mentors"
        name={mentor.fullName}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(100%,20rem)] lg:items-start">
        <div className="space-y-6">
          <InstructorProfileHeader
            badge="Coaching mentor"
            fullName={mentor.fullName}
            headline={mentor.headline}
            bioPreview={bioText}
            avatarSrc={avatarSrc}
            initials={initials}
            teachesLabel="Mentoring & coaching"
            speaksLabel={focusLabel}
            stats={stats.slice(0, 3)}
          />

          <MentorCoachingSection
            mentorName={mentor.fullName}
            specialties={mentor.specialties}
            headline={mentor.headline}
          />

          <InstructorAvailabilitySection
            availability={profile.availability}
            timezoneLabel={timezoneLabel}
          />

          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                About me
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              {bioParagraphs.map((para) => (
                <p key={para}>{para}</p>
              ))}
              {mentor.specialties.length > 0 ? (
                <ul className="flex flex-wrap gap-2 pt-1">
                  {mentor.specialties.map((tag) => (
                    <li key={tag}>
                      <Badge variant="secondary">{tag}</Badge>
                    </li>
                  ))}
                </ul>
              ) : null}
            </CardContent>
          </Card>

          <InstructorHighlightCards
            cards={[
              {
                icon: Sparkles,
                title: "Coaching focus",
                description: coachingBlurb,
              },
              {
                icon: Target,
                title: "Career guidance",
                description: careerBlurb,
              },
            ]}
          />
        </div>

        <InstructorBookingSidebar
          hostId={mentor.id}
          hostName={mentor.fullName}
          hostKind="mentor"
          availability={availabilityRowsForSidebar}
          timezoneLabel={timezoneLabel}
          enrolledCourses={[]}
          avgRating={mentor.stats.avgRating}
          reviewCount={mentor.stats.reviewCount}
        />
      </div>

      <FooterLink href={backHref} label={backLabel} />
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <p className="text-center text-xs text-muted-foreground">
      <Link
        href={href}
        className="font-semibold text-[var(--primary)] hover:underline"
      >
        ← {label}
      </Link>
    </p>
  );
}
