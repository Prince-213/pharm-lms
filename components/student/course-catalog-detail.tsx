import {
  BarChart,
  Check,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Link2,
  Lock,
  MessageSquareQuote,
  Play,
  ShieldCheck,
  Star,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { CatalogCourseContent } from "@/components/student/catalog-course-content";
import { CatalogPaidPurchaseSection } from "@/components/student/catalog-paid-purchase-section";
import { CatalogPreviewMedia } from "@/components/student/catalog-preview-media";
import { CatalogPurchaseRail } from "@/components/student/catalog-purchase-rail";
import { EnrollCourseButton } from "@/components/student/enroll-course-button";
import { WishlistHeartButton } from "@/components/student/wishlist-heart-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import type { CatalogCoursePayload } from "@/lib/course-catalog-detail";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";
import { formatTotalDuration } from "@/lib/lesson-duration";
import {
  formatResourceMetaLine,
  resourceDownloadFilename,
} from "@/lib/section-resource-meta";
import {
  udemyBorderClass,
  udemyCardShadow,
  udemySurfaceMutedClass,
} from "@/lib/ui/udemy-surface";
import { cn } from "@/lib/utils";

type Variant = "catalog" | "tutorPreview";

export type CatalogInteraction = "student" | "readonly" | "guest";

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-[1.375rem] font-bold leading-snug tracking-tight text-[var(--foreground)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function nameInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    const w = parts[0];
    if (!w) return "?";
    return w.length >= 2 ? w.slice(0, 2).toUpperCase() : w[0].toUpperCase();
  }
  const first = parts[0]?.[0];
  const last = parts[parts.length - 1]?.[0];
  const out = `${first ?? ""}${last ?? ""}`.toUpperCase();
  return out || "?";
}

function CatalogReviewStars({ rating }: { rating: number }) {
  const clamped = Math.min(5, Math.max(0, rating));
  return (
    <span
      role="img"
      className="flex gap-0.5"
      aria-label={`${clamped} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-3.5 w-3.5",
            star <= clamped
              ? "fill-amber-400 text-amber-400"
              : "text-[#e3e5e8]",
          )}
          strokeWidth={star <= clamped ? 0 : 1}
          aria-hidden
        />
      ))}
    </span>
  );
}

export function CourseCatalogDetail({
  variant,
  interaction,
  data,
  catalogNavOverride,
  guestAuth,
}: {
  variant: Variant;
  interaction: CatalogInteraction;
  data: CatalogCoursePayload;
  /** When set (e.g. admin overview), replaces the first catalog breadcrumb target. */
  catalogNavOverride?: { href: string; label: string };
  /** Sign-in / sign-up targets for unauthenticated visitors. */
  guestAuth?: { callbackUrl: string };
}) {
  const {
    course,
    courseId,
    thumb,
    promoVideoHref,
    enrollment,
    wishlistRow,
    isStudent,
    displayPriceMinorUnits,
    displayPriceCurrency,
    ratingAverage,
    reviewCount,
    reviews,
    totalSeconds,
    totalLectures,
    totalQuizzes,
    totalAssignments,
    allResources,
    bullets,
  } = data;

  const canAct = interaction === "student" && variant === "catalog";
  const isGuest = interaction === "guest" && variant === "catalog";
  const showResourceLinks = canAct && Boolean(enrollment);
  const catalogHref =
    catalogNavOverride?.href ?? (isGuest ? "/courses" : "/student/browse");
  const catalogLabel =
    catalogNavOverride?.label ?? (isGuest ? "Catalog" : "Catalog");

  const sectionCount = course.sections.length;
  const contentSummary = [
    `${sectionCount} section${sectionCount === 1 ? "" : "s"}`,
    `${totalLectures} lecture${totalLectures === 1 ? "" : "s"}`,
    `${formatTotalDuration(totalSeconds)} total length`,
  ].join(" · ");

  const enrollCount = course._count.enrollments;
  const showBestseller = enrollCount >= 50;

  return (
    <div
      className={cn(
        "min-h-screen font-sans text-[var(--foreground)]",
        udemySurfaceMutedClass,
        "selection:bg-[var(--primary-soft)] selection:text-[var(--primary-strong)]",
      )}
    >
      {/* Udemy-style full-bleed hero (dark band) */}
      <div className="bg-[var(--header)] text-[var(--header-fg)]">
        <div className="mx-auto max-w-[1184px] px-4 pt-6 pb-28 sm:px-6 sm:pb-32 lg:px-8 lg:pb-40">
          <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-[#c0c4fc] sm:text-sm">
            {variant === "catalog" ? (
              <>
                <Link
                  href={catalogHref}
                  className="text-[#c0c4fc] underline-offset-2 hover:text-white hover:underline"
                >
                  {catalogLabel}
                </Link>
                <ChevronRight className="h-3 w-3 opacity-70" aria-hidden />
              </>
            ) : (
              <>
                <Link
                  href={`/tutor/courses/${courseId}/manage`}
                  className="text-[#c0c4fc] underline-offset-2 hover:text-white hover:underline"
                >
                  Course editor
                </Link>
                <ChevronRight className="h-3 w-3 opacity-70" aria-hidden />
              </>
            )}
            <span className="text-[var(--header-fg-muted)]">
              {course.category || "General"}
            </span>
          </nav>

          <h1 className="max-w-4xl text-2xl font-bold leading-snug tracking-tight sm:text-3xl md:text-[2rem] md:leading-tight lg:text-[2.375rem]">
            {course.title}
          </h1>

          {course.subtitle ? (
            <p className="mt-3 max-w-3xl text-base font-normal leading-relaxed text-[var(--header-fg)]/90 sm:text-lg">
              {course.subtitle}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
            {showBestseller ? (
              <span className="rounded-sm bg-[#eceb98] px-2 py-0.5 text-xs font-bold tracking-wide text-[#3d3c0a]">
                Bestseller
              </span>
            ) : null}
            {showBestseller ? (
              <span
                className="text-[var(--header-fg-muted)]"
                aria-hidden="true"
              >
                ·
              </span>
            ) : null}
            {ratingAverage != null && reviewCount > 0 ? (
              <>
                <span className="inline-flex items-center gap-1 font-bold text-[#ffd60f]">
                  <Star
                    className="h-4 w-4 shrink-0 fill-current text-[#ffd60f]"
                    aria-hidden
                  />
                  {ratingAverage.toFixed(1)}
                </span>
                <span className="font-semibold text-[#c0c4fc] underline decoration-[#c0c4fc] underline-offset-2">
                  ({reviewCount.toLocaleString()}{" "}
                  {reviewCount === 1 ? "rating" : "ratings"})
                </span>
              </>
            ) : (
              <span className="text-[var(--header-fg-muted)]">
                No ratings yet
              </span>
            )}
            <span className="text-[var(--header-fg-muted)]" aria-hidden="true">
              ·
            </span>
            <span className="font-bold text-[#c0c4fc] underline decoration-[#c0c4fc] underline-offset-2">
              {enrollCount.toLocaleString()} students
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--header-fg-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <BarChart className="h-4 w-4 shrink-0 text-[var(--header-fg)]" />
              {course.level || "All levels"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Globe className="h-4 w-4 shrink-0 text-[var(--header-fg)]" />
              {course.language || "English"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0 text-[var(--header-fg)]" />
              {formatTotalDuration(totalSeconds)}
            </span>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-white/30 bg-white/10">
              {course.mentor.avatarUrl ? (
                // biome-ignore lint/performance/noImgElement: Mentor avatars may be OAuth/CDN URLs.
                <img
                  src={course.mentor.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                  {course.mentor.fullName[0]}
                </div>
              )}
            </div>
            <div className="min-w-0 text-sm">
              <span className="text-[var(--header-fg-muted)]">Created by </span>
              <span className="font-bold text-[#c0c4fc] underline decoration-[#c0c4fc] underline-offset-2">
                {course.mentor.fullName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlapping two-column band (stats + main | sticky purchase card) */}
      <div className="relative z-10 mx-auto max-w-[1184px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="order-2 min-w-0 space-y-8 lg:order-1 lg:col-span-8 lg:-mt-24 lg:space-y-10">
            {/* What you'll learn */}
            <section className="space-y-3">
              <SectionHeading title="What you'll learn" />
              <div
                className={cn(
                  "border bg-white",
                  udemyBorderClass,
                  "shadow-[0_2px_4px_rgba(0,0,0,0.05)]",
                )}
              >
                <div className="grid divide-y divide-[#d1d7dc] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                  {bullets.map((b) => (
                    <div
                      key={b}
                      className="flex gap-3 px-5 py-4 text-sm leading-snug sm:px-6 sm:py-5"
                    >
                      <Check
                        className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#6a6f73]"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <span className="text-[var(--foreground)]">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <CatalogCourseContent
              sections={course.sections}
              assignments={course.assignments}
              contentSummary={contentSummary}
              totalLectures={totalLectures}
              totalQuizzes={totalQuizzes}
              totalAssignments={totalAssignments}
            />

            <section className="space-y-3">
              <SectionHeading title="Description" />
              <div
                className={cn(
                  "border bg-white px-5 py-6 sm:px-8 sm:py-8",
                  udemyBorderClass,
                  "shadow-[0_2px_4px_rgba(0,0,0,0.05)]",
                )}
              >
                <div
                  className="prose-custom max-w-none text-base leading-relaxed text-muted-foreground [&_a]:font-semibold [&_a]:text-[var(--primary)] [&_a]:underline [&_li]:mb-1 [&_p]:mb-4 [&_strong]:text-[var(--foreground)] [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: Rich text from course editor (mentor-controlled).
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              </div>
            </section>

            <section id="course-reviews" className="space-y-3">
              <SectionHeading
                title="Reviews"
                description={
                  reviewCount > 0
                    ? `Student feedback (${reviewCount.toLocaleString()} ${reviewCount === 1 ? "rating" : "ratings"}).`
                    : "Ratings and comments from enrolled students."
                }
              />
              <div
                className={cn(
                  "border bg-white",
                  udemyBorderClass,
                  "shadow-[0_2px_4px_rgba(0,0,0,0.05)]",
                )}
              >
                {reviews.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 px-6 py-14 text-center sm:py-16">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d1d7dc] bg-[#f7f9fa] text-muted-foreground"
                      aria-hidden
                    >
                      <MessageSquareQuote
                        className="h-7 w-7"
                        strokeWidth={1.5}
                      />
                    </div>
                    <p className="text-base font-bold text-[var(--foreground)]">
                      No reviews yet
                    </p>
                    <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                      When learners rate this course and share optional written
                      feedback, their reviews will show up here.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-[#d1d7dc]">
                    {reviews.map((r) => (
                      <li key={r.id} className="px-5 py-5 sm:px-6 sm:py-5">
                        <div className="flex gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {nameInitials(r.student.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                              <p className="truncate text-sm font-bold text-[var(--foreground)]">
                                {r.student.fullName}
                              </p>
                              <time
                                dateTime={r.createdAt.toISOString()}
                                className="shrink-0 text-xs tabular-nums text-muted-foreground"
                              >
                                {r.createdAt.toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </time>
                            </div>
                            <CatalogReviewStars rating={r.rating} />
                            {r.comment?.trim() ? (
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {r.comment.trim()}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {allResources.length > 0 ? (
              <section className="space-y-3">
                <SectionHeading
                  title="Resources"
                  description={
                    showResourceLinks
                      ? undefined
                      : variant === "tutorPreview"
                        ? "Students unlock downloads after they enroll."
                        : "Enroll to unlock downloadable files and links."
                  }
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  {allResources.map((res, i) => (
                    <div
                      key={`${res.id}-${i}`}
                      className={cn(
                        "flex items-center gap-3 border bg-white p-4",
                        udemyBorderClass,
                        "shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]",
                      )}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-[#d1d7dc] bg-[#f7f9fa] text-[var(--primary)]">
                        {res.type === "FILE" ? (
                          <FileText className="h-5 w-5" />
                        ) : (
                          <Link2 className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[var(--foreground)]">
                          {res.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {formatResourceMetaLine(res)}
                        </p>
                      </div>
                      {showResourceLinks ? (
                        res.href ? (
                          res.type === "FILE" ? (
                            <a
                              href={res.href}
                              download={resourceDownloadFilename(res)}
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-[#d1d7dc] bg-white text-muted-foreground transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                              aria-label={`Download ${res.title}`}
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          ) : (
                            <a
                              href={res.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-[#d1d7dc] bg-white text-muted-foreground transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                              aria-label={`Open link: ${res.title}`}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )
                        ) : (
                          <span
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-[#d1d7dc] bg-[#f7f9fa] text-muted-foreground/50"
                            title="File link could not be resolved"
                          >
                            <Download className="h-4 w-4" />
                          </span>
                        )
                      ) : (
                        <div
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-[#d1d7dc] bg-[#f7f9fa] text-muted-foreground/40"
                          title="Enroll to access"
                        >
                          <Lock className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <div
              className={cn(
                "border bg-white px-5 py-6 sm:px-8 sm:py-8",
                udemyBorderClass,
                "shadow-[0_2px_4px_rgba(0,0,0,0.05)]",
              )}
            >
              <h2 className="text-[1.375rem] font-bold text-[var(--foreground)]">
                Instructor
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your course mentor on this program.
              </p>
              <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-sm border border-[#d1d7dc] bg-[#f7f9fa]">
                  {course.mentor.avatarUrl ? (
                    // biome-ignore lint/performance/noImgElement: Mentor avatars may be OAuth/CDN URLs.
                    <img
                      src={course.mentor.avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                      {course.mentor.fullName[0]}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-[var(--foreground)]">
                    {course.mentor.fullName}
                  </h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
                    Mentor
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-sm border border-[#d1d7dc] bg-[#f7f9fa] px-2.5 py-1 text-xs font-bold text-[var(--foreground)]">
                      <ShieldCheck className="h-3.5 w-3.5 text-[var(--primary)]" />
                      Verified
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-sm border border-[#d1d7dc] bg-[#f7f9fa] px-2.5 py-1 text-xs font-bold text-[var(--foreground)]">
                      <BarChart className="h-3.5 w-3.5 text-[var(--primary)]" />
                      Expert mentor
                    </span>
                  </div>
                  {course.mentor.bio ? (
                    <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                      {course.mentor.bio}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <aside className="order-1 lg:order-2 lg:col-span-4 lg:-mt-[22rem] lg:self-start">
            <CatalogPurchaseRail>
              <Card
                className={cn(
                  "overflow-hidden rounded-sm bg-white",
                  udemyBorderClass,
                  udemyCardShadow,
                )}
              >
                <CatalogPreviewMedia
                  thumb={thumb}
                  promoVideoHref={promoVideoHref}
                />
                <CardHeader className="space-y-1 border-b border-[#d1d7dc] px-5 pb-4 pt-5 sm:px-6">
                  <p className="text-[2rem] font-bold tabular-nums leading-none tracking-tight text-[var(--foreground)]">
                    {formatMinorUnitsToCurrency(
                      displayPriceMinorUnits ?? course.priceMinorUnits,
                      displayPriceCurrency ?? course.priceCurrency,
                      { zeroAsFree: true },
                    )}
                  </p>
                  {variant === "tutorPreview" ? (
                    <CardDescription className="text-xs leading-relaxed">
                      Price reflects your settings; publish to show in the
                      student catalog.
                    </CardDescription>
                  ) : null}
                </CardHeader>

                <CardContent className="space-y-3 px-5 pb-6 pt-4 sm:px-6">
                  {variant === "catalog" ? (
                    <>
                      {enrollment && canAct ? (
                        <Link
                          href={`/student/course/${courseId}`}
                          className="flex h-12 w-full items-center justify-center rounded-sm bg-[var(--primary)] text-base font-bold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-strong)]"
                        >
                          Continue learning
                        </Link>
                      ) : enrollment && !canAct ? (
                        <div
                          className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-sm bg-[var(--surface-muted)] text-center text-sm font-bold text-muted-foreground"
                          title="Preview mode"
                        >
                          Continue learning (preview)
                        </div>
                      ) : canAct && isStudent ? (
                        (course.priceMinorUnits ?? 0) > 0 ? (
                          <CatalogPaidPurchaseSection
                            courseId={courseId}
                            basePriceMinorUnits={course.priceMinorUnits ?? 0}
                            priceCurrency={course.priceCurrency}
                            displayCurrency={displayPriceCurrency}
                            wishlist={
                              <WishlistHeartButton
                                courseId={courseId}
                                initialSaved={Boolean(wishlistRow)}
                                variant="toolbar"
                                className="h-12 max-w-[18%] min-w-0 shrink-0"
                              />
                            }
                          />
                        ) : (
                          <div className="flex gap-2">
                            <div className="w-[80%] min-w-0 shrink-0">
                              <EnrollCourseButton
                                courseId={courseId}
                                label="Enroll now"
                                variant="catalog"
                                className="min-h-12 w-full rounded-sm px-6 py-3 text-base font-bold"
                              />
                            </div>
                            <WishlistHeartButton
                              courseId={courseId}
                              initialSaved={Boolean(wishlistRow)}
                              variant="toolbar"
                              className="h-12 max-w-[18%] min-w-0 shrink-0"
                            />
                          </div>
                        )
                      ) : isGuest && guestAuth ? (
                        <div className="space-y-3">
                          <Link
                            href={`/student/login?callbackUrl=${encodeURIComponent(guestAuth.callbackUrl)}`}
                            className="flex h-12 w-full items-center justify-center rounded-sm bg-[var(--primary)] text-base font-bold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-strong)]"
                          >
                            Sign in to enroll
                          </Link>
                          <Link
                            href={`/student/signup?callbackUrl=${encodeURIComponent(guestAuth.callbackUrl)}`}
                            className="flex h-11 w-full items-center justify-center rounded-sm border-2 border-[var(--foreground)] bg-transparent text-sm font-bold text-[var(--foreground)] transition-colors hover:bg-[#f7f9fa]"
                          >
                            Create free account
                          </Link>
                        </div>
                      ) : canAct && !isStudent ? (
                        <div className="rounded-sm border border-[#d1d7dc] bg-[#f7f9fa] p-4 text-center">
                          <p className="text-sm font-bold text-[var(--foreground)]">
                            Sign in to enroll
                          </p>
                          <Link
                            href="/student/login"
                            className="mt-2 inline-block text-sm font-bold text-[var(--primary)] underline underline-offset-2"
                          >
                            Student login
                          </Link>
                        </div>
                      ) : (
                        <div className="rounded-sm border border-[#d1d7dc] bg-[#f7f9fa] p-4 text-center text-sm font-semibold text-muted-foreground">
                          Preview mode — enroll and wishlist are disabled.
                        </div>
                      )}
                      {canAct || isGuest ? (
                        <Link
                          href={isGuest ? "/courses" : "/student/browse"}
                          className="flex h-11 w-full items-center justify-center rounded-sm border-2 border-[var(--foreground)] bg-transparent text-sm font-bold text-[var(--foreground)] transition-colors hover:bg-[#f7f9fa]"
                        >
                          Browse more courses
                        </Link>
                      ) : (
                        <span className="flex h-11 w-full cursor-not-allowed items-center justify-center rounded-sm border-2 border-[#d1d7dc] bg-[#f7f9fa] text-sm font-bold text-muted-foreground">
                          Browse more courses
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="rounded-sm border border-[#d1d7dc] bg-[#f7f9fa] p-4 text-sm text-muted-foreground">
                        <p className="font-bold text-[var(--foreground)]">
                          Student preview
                        </p>
                        <p className="mt-1 leading-relaxed">
                          This is how your listing appears before enrollment.
                          Students enroll from the catalog after you publish.
                        </p>
                      </div>
                      <Link
                        href={`/tutor/courses/${courseId}/manage`}
                        className="flex h-11 w-full items-center justify-center rounded-sm border-2 border-[var(--foreground)] bg-transparent text-sm font-bold text-[var(--foreground)] transition-colors hover:bg-[#f7f9fa]"
                      >
                        Back to editor
                      </Link>
                    </>
                  )}

                  <div className="border-t border-[#d1d7dc] pt-5">
                    <p className="text-sm font-bold text-[var(--foreground)]">
                      This course includes:
                    </p>
                    <ul className="mt-4 grid gap-x-6 gap-y-3 text-sm text-muted-foreground sm:grid-cols-2">
                      <li className="flex gap-2">
                        <Play
                          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--foreground)]"
                          aria-hidden
                        />
                        <span>
                          <span className="font-bold text-[var(--foreground)]">
                            {formatTotalDuration(totalSeconds)}
                          </span>{" "}
                          on-demand video
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <FileText
                          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--foreground)]"
                          aria-hidden
                        />
                        <span>
                          <span className="font-bold text-[var(--foreground)]">
                            {allResources.length}
                          </span>{" "}
                          articles & resources
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <Globe
                          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--foreground)]"
                          aria-hidden
                        />
                        <span>Full lifetime access</span>
                      </li>
                      <li className="flex gap-2">
                        <ShieldCheck
                          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--foreground)]"
                          aria-hidden
                        />
                        <span>Certificate of completion</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </CatalogPurchaseRail>
          </aside>
        </div>
      </div>
    </div>
  );
}
