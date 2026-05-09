import { Check, ChevronRight, Play, FileText, Link2, BookOpen, Clock, Users, Globe, BarChart, ShieldCheck, HelpCircle, ClipboardList, Lock } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { EnrollCourseButton } from "@/components/student/enroll-course-button";
import { WishlistHeartButton } from "@/components/student/wishlist-heart-button";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";
import { stripHtmlToPlainText } from "@/lib/html-preview";
import {
  formatLessonDuration,
  formatTotalDuration,
  sumLessonSeconds,
} from "@/lib/lesson-duration";
import { resolveMediaUrl } from "@/lib/media-url";
import { parseSectionDescription } from "@/lib/curriculum";

const CATEGORY_CHIPS = [
  "Clinical pharmacy",
  "Community care",
  "Dosage & safety",
  "Patient counseling",
  "Regulatory",
];

export default async function StudentCourseCatalogDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect(
      `/student/login?callbackUrl=/student/browse/${(await params).courseId}`,
    );
  }

  const { courseId } = await params;
  const course = await db.course.findFirst({
    where: { 
      id: courseId,
      OR: [
        { status: CourseStatus.PUBLISHED },
        { mentorId: session.user.id }
      ]
    },
    include: {
      mentor: { select: { fullName: true, bio: true, avatarUrl: true } },
      sections: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            select: { id: true, title: true, durationSec: true },
          },
          quizzes: {
            select: { id: true, title: true },
          }
        },
      },
      assignments: {
        select: { id: true, title: true, description: true },
      },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) notFound();

  const isStudent = session.user.role === UserRole.STUDENT;
  const enrollment =
    isStudent &&
    (await db.enrollment.findUnique({
      where: {
        courseId_studentId: { courseId, studentId: session.user.id },
      },
    }));
  const wishlistRow =
    isStudent &&
    (await db.wishlist.findUnique({
      where: { studentId_courseId: { studentId: session.user.id, courseId } },
      select: { id: true },
    }));

  const totalSeconds = sumLessonSeconds(course.sections);
  const totalLectures = course.sections.reduce(
    (n, s) => n + s.lessons.length,
    0,
  );
  
  // Count quizzes and total items
  const totalQuizzes = course.sections.reduce((n, s) => n + s.quizzes.length, 0);
  const totalAssignments = course.assignments.length;
  
  const thumb = await resolveMediaUrl(course.thumbnailUrl);
  const bullets = CATEGORY_CHIPS.slice(0, 4);

  // Parse resources from all sections
  const allResources = course.sections.flatMap(s => parseSectionDescription(s.description).resources);

  return (
    <div className="min-h-screen bg-[#f8faff] font-sans selection:bg-[var(--primary-soft)] selection:text-[var(--primary-strong)]">
      {/* Premium Aurora Banner */}
      <div className="relative overflow-hidden bg-[var(--ink-deep)] py-12 lg:py-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] h-[120%] w-[120%] animate-aurora opacity-30 blur-3xl [background:linear-gradient(135deg,var(--primary-strong)_0%,transparent_25%,var(--primary)_50%,transparent_75%,var(--primary-soft)_100%)]" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
            <div className="flex flex-col justify-center text-white">
              <nav className="mb-6 flex items-center gap-2 text-sm font-medium text-[var(--primary-soft)]">
                <Link href="/student/browse" className="transition-colors hover:text-white">Catalog</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-white/60">{course.category || "Pharmacy"}</span>
              </nav>
              
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:leading-[1.1]">
                {course.title}
              </h1>
              
              {course.subtitle && (
                <p className="mt-6 text-lg leading-relaxed text-white/80 md:text-xl">
                  {course.subtitle}
                </p>
              )}
              
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-[var(--primary-soft)]" />
                  <span>{course.level || "All Levels"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[var(--primary-soft)]" />
                  <span>{course._count.enrollments} Learners enrolled</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[var(--primary-soft)]" />
                  <span>{course.language || "English"}</span>
                </div>
                <div className="flex items-center gap-2">
                   <Clock className="h-4 w-4 text-[var(--primary-soft)]" />
                   <span>{formatTotalDuration(totalSeconds)}</span>
                </div>
              </div>
              
              <div className="mt-10 flex items-center gap-4">
                 <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-[var(--primary-soft)] bg-white/10 p-0.5">
                    {course.mentor.avatarUrl ? (
                      <img src={course.mentor.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                        {course.mentor.fullName[0]}
                      </div>
                    )}
                 </div>
                 <div>
                   <p className="text-sm font-semibold leading-none">Created by</p>
                   <p className="mt-1 text-base font-bold text-[var(--primary-soft)]">{course.mentor.fullName}</p>
                 </div>
              </div>
            </div>

            {/* Mobile Header Image Placeholder (Hidden on Desktop) */}
            <div className="lg:hidden">
               <div className="aspect-video overflow-hidden rounded-2xl border border-white/20 bg-white/5 shadow-2xl backdrop-blur-sm">
                  {thumb ? (
                    <img src={thumb} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-white/10">
                      <BookOpen className="h-12 w-12 text-white/20" />
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          <div className="space-y-16">
            {/* Outcomes */}
            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900">
                <div className="h-8 w-1.5 rounded-full bg-[var(--primary)]" />
                What you&apos;ll achieve
              </h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {bullets.map((b) => (
                  <div key={b} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-[var(--primary-soft)] hover:shadow-md">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)]/20 text-[var(--primary)]">
                       <Check className="h-5 w-5" strokeWidth={3} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{b} Mastery</h3>
                      <p className="mt-1 text-sm text-slate-500">Comprehensive understanding of {b.toLowerCase()} principles.</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum */}
            <section>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900">
                    <div className="h-8 w-1.5 rounded-full bg-[var(--primary)]" />
                    Course Blueprint
                  </h2>
                  <p className="mt-2 text-slate-500">Structured path designed by clinical experts.</p>
                </div>
                <div className="flex items-center gap-4 text-sm font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5"><Play className="h-4 w-4 text-[var(--primary)]" fill="currentColor" /> {totalLectures} Lectures</span>
                  <span className="flex items-center gap-1.5"><HelpCircle className="h-4 w-4 text-amber-500" /> {totalQuizzes} Quizzes</span>
                  <span className="flex items-center gap-1.5"><ClipboardList className="h-4 w-4 text-emerald-500" /> {totalAssignments} Tasks</span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {course.sections.map((section, idx) => {
                  const sectionAssignments = course.assignments.filter(a => a.description?.includes(`Section:${section.id}`));
                  return (
                    <details key={section.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all open:ring-2 open:ring-[var(--primary-soft)]/50" open={idx === 0}>
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-slate-50/50 px-6 py-5 hover:bg-slate-50">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-400 border border-slate-200 group-open:bg-[var(--primary)] group-open:text-white group-open:border-transparent">
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">{section.title}</h3>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {section.lessons.length} lessons · {section.quizzes.length} quizzes
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="border-t border-slate-100 p-2">
                        <div className="space-y-1">
                          {section.lessons.map(lesson => (
                            <div key={lesson.id} className="group/item flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-colors hover:bg-slate-50">
                               <div className="flex items-center gap-4 text-slate-700">
                                 <Play className="h-4 w-4 text-slate-400 transition-colors group-hover/item:text-[var(--primary)]" fill="currentColor" />
                                 <span className="font-medium">{lesson.title}</span>
                               </div>
                               <span className="text-xs text-slate-400">{formatLessonDuration(lesson.durationSec)}</span>
                            </div>
                          ))}
                          {section.quizzes.map(quiz => (
                            <div key={quiz.id} className="group/item flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-colors hover:bg-amber-50/50">
                               <div className="flex items-center gap-4 text-slate-700 font-medium">
                                 <HelpCircle className="h-4 w-4 text-amber-400" />
                                 <span>Section Quiz: {quiz.title}</span>
                               </div>
                               <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] uppercase font-bold text-amber-700">Quiz</span>
                            </div>
                          ))}
                          {sectionAssignments.map(assignment => (
                             <div key={assignment.id} className="group/item flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-colors hover:bg-emerald-50/50">
                               <div className="flex items-center gap-4 text-slate-700 font-medium">
                                 <ClipboardList className="h-4 w-4 text-emerald-400" />
                                 <span>{assignment.title}</span>
                               </div>
                               <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] uppercase font-bold text-emerald-700">Assignment</span>
                             </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  );
                })}
              </div>
            </section>

            {/* Description */}
            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900">
                <div className="h-8 w-1.5 rounded-full bg-[var(--primary)]" />
                About this course
              </h2>
              <div className="mt-8">
                <div
                   className="prose-custom max-w-none text-base leading-relaxed text-slate-600 [&_a]:text-[var(--primary)] [&_a]:underline [&_a]:font-semibold [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1 [&_strong]:text-slate-900"
                   dangerouslySetInnerHTML={{ __html: course.description }}
                />
              </div>
            </section>

            {/* Resources (Dynamic) */}
            {allResources.length > 0 && (
               <section>
                 <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900">
                   <div className="h-8 w-1.5 rounded-full bg-indigo-500" />
                   Course Resources
                 </h2>
                 <div className="mt-8 grid gap-4 sm:grid-cols-2">
                   {allResources.map((res, i) => (
                      <div key={i} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:ring-2 hover:ring-indigo-100">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                           {res.type === "FILE" ? <FileText className="h-6 w-6" /> : <Link2 className="h-6 w-6" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-slate-900">{res.title}</p>
                          <p className="text-xs text-slate-500 uppercase font-semibold">{res.type} Content</p>
                        </div>
                        {enrollment ? (
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors">
                            <ChevronRight className="h-5 w-5" />
                          </a>
                        ) : (
                          <div className="rounded-lg bg-slate-50 p-2 text-slate-300 backdrop-grayscale">
                            <Lock className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                   ))}
                 </div>
                 {!enrollment && (
                    <p className="mt-4 text-center text-sm text-slate-400 font-medium italic">
                       Enroll now to unlock all downloadable resources and links.
                    </p>
                 )}
               </section>
            )}

            {/* Instructor Profile */}
            <section className="rounded-3xl border border-slate-200 bg-white p-8 lg:p-10">
               <div className="flex flex-col gap-8 md:flex-row md:items-start">
                  <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-slate-100 shadow-inner ring-4 ring-slate-100">
                     {course.mentor.avatarUrl ? (
                        <img src={course.mentor.avatarUrl} alt="" className="h-full w-full object-cover" />
                     ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl font-black text-slate-300">
                          {course.mentor.fullName[0]}
                        </div>
                     )}
                  </div>
                  <div className="flex-1">
                     <h2 className="text-2xl font-black text-slate-900">{course.mentor.fullName}</h2>
                     <p className="mt-1 font-bold text-[var(--primary)] uppercase tracking-wider text-xs">Instructor & Clinical Mentor</p>
                     <div className="mt-6 flex flex-wrap gap-4">
                        <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-600">
                           <ShieldCheck className="h-4 w-4 text-emerald-500" />
                           Identity Verified
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-600">
                           <BarChart className="h-4 w-4 text-indigo-500" />
                           Expert Mentor
                        </div>
                     </div>
                     {course.mentor.bio && (
                        <p className="mt-8 text-base leading-relaxed text-slate-600">
                          {course.mentor.bio}
                        </p>
                     )}
                  </div>
               </div>
            </section>
          </div>

          {/* Sticky Sidebar */}
          <aside className="lg:sticky lg:top-8">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
              {/* Media Preview */}
              <div className="group relative aspect-video overflow-hidden bg-slate-900">
                {thumb ? (
                  <img src={thumb} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <BookOpen className="h-16 w-16 text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                   <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[var(--primary)] shadow-xl">
                      <Play className="h-6 w-6 ml-1" fill="currentColor" />
                   </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-center">
                   <div className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                      Preview this course
                   </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-black text-slate-900 leading-none">
                     {formatMinorUnitsToCurrency(course.priceMinorUnits, course.priceCurrency)}
                   </span>
                </div>

                <div className="mt-8 space-y-4">
                  {enrollment ? (
                    <Link
                      href={`/student/course/${courseId}`}
                      className="flex h-14 w-full items-center justify-center rounded-2xl bg-[var(--primary)] text-base font-black text-white shadow-lg shadow-[var(--primary-soft)]/40 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      Continue Learning
                    </Link>
                  ) : isStudent ? (
                    <>
                      <EnrollCourseButton
                        courseId={courseId}
                        label="Enroll Now"
                        variant="catalog"
                        className="h-14 w-full text-base font-black shadow-lg shadow-[var(--primary-soft)]/40 hover:scale-[1.02] active:scale-95"
                      />
                      <WishlistHeartButton
                        courseId={courseId}
                        initialSaved={Boolean(wishlistRow)}
                        variant="labeled"
                        className="h-14 w-full rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
                      />
                    </>
                  ) : (
                    <div className="rounded-2xl bg-amber-50 p-4 text-center">
                      <p className="text-sm font-bold text-amber-800">Please sign in to enroll</p>
                      <Link href="/student/login" className="mt-2 inline-block text-xs font-black text-amber-700 underline uppercase tracking-wider">
                        Login as student
                      </Link>
                    </div>
                  )}

                  <Link
                    href="/student/browse"
                    className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-50 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100"
                  >
                    Explore other courses
                  </Link>
                </div>

                {/* Features List */}
                <div className="mt-10 space-y-5 border-t border-slate-100 pt-8">
                   <p className="text-sm font-black text-slate-900 uppercase tracking-widest">This course includes:</p>
                   <ul className="space-y-4">
                      <li className="flex items-start gap-4">
                         <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500 mt-0.5">
                            <Clock className="h-3 w-3" />
                         </div>
                         <p className="text-sm font-medium text-slate-600"><span className="font-bold text-slate-900">{formatTotalDuration(totalSeconds)}</span> content on-demand</p>
                      </li>
                      <li className="flex items-start gap-4">
                         <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mt-0.5">
                            <FileText className="h-3 w-3" />
                         </div>
                         <p className="text-sm font-medium text-slate-600"><span className="font-bold text-slate-900">{allResources.length}</span> Downloadable resources</p>
                      </li>
                      <li className="flex items-start gap-4">
                         <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 mt-0.5">
                            <Globe className="h-3 w-3" />
                         </div>
                         <p className="text-sm font-medium text-slate-600">Full lifetime access</p>
                      </li>
                      <li className="flex items-start gap-4">
                         <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500 mt-0.5">
                            <ShieldCheck className="h-3 w-3" />
                         </div>
                         <p className="text-sm font-medium text-slate-600">Curated & Verified content</p>
                      </li>
                   </ul>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
