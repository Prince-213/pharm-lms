# Pharm LMS — Project Report

**Product:** Pharm LMS (PharmLMS)  
**Type:** Web-based Learning Management System for pharmacy and clinical training  
**Stack:** Next.js 16 · React 19 · PostgreSQL · Prisma · NextAuth · Paystack · Cloudflare R2  
**Report date:** May 2026  

---

## 1. Executive summary

Pharm LMS is a company-owned learning platform that connects **students**, **tutors (course authors)**, **mentors (1:1 coaching)**, and **administrators** in a single product. Learners discover courses, pay where required, progress through structured curriculum, complete assessments, book meetings, and earn badges and **digital certificates**. Tutors build and submit courses for approval; admins govern quality, users, payments, and platform settings.

The platform is production-oriented: role-based portals, Paystack checkout and tutor payouts, media on object storage, and a modern maintainable codebase suitable for ongoing feature work and deployment on Vercel.

---

## 2. Platform overview

| Portal | Route prefix | Primary users |
|--------|--------------|---------------|
| Student | `/student` | Learners |
| Tutor | `/tutor` | Course creators |
| Mentor | `/mentor` | 1:1 coaches |
| Admin | `/admin` | Operations & governance |

**Role model:** Tutors own courses (`Course.mentorId`). Mentors handle meetings and profile approval only. Students consume content. Admins approve courses, manage CRM, payments, badges, and messaging.

---

## 3. Student features (implemented)

### 3.1 Learning journey

- **Catalog & search** — Browse published courses, filters, wishlist.
- **Enrollment** — Free enroll or **Paystack** paid checkout (`react-paystack` inline popup).
- **Course player** — Video and article lessons, sidebar curriculum, lesson progress, prev/next navigation.
- **Section quizzes** — Modal quizzes with scoring and attempt history.
- **AI quiz** — Generated practice from course content (Hugging Face, configurable).
- **AI course assistant** — Context-aware chat after completing sections.
- **Assignments** — Cross-course hub: submit text and files; view grades and feedback.
- **Forums & announcements** — Course discussion and tutor announcements (gated by enrollment and payment).
- **Reviews** — Star ratings and comments when eligible.
- **Lesson notes** — Per-lesson student notes.
- **Course completion** — Manual “Complete course” when curriculum is finished; celebration modal with tutor congratulatory content (video/article).

### 3.2 Recognition & credentials

- **Badges** — Rule-based achievements (enrollment, lessons, quizzes, streaks, meetings); toast on earn; dedicated achievements page.
- **Leaderboard** — Rankings from lessons, quiz scores, badges, and streaks.
- **Digital certificates (new)** — On course completion, the system issues a **Pharm LMS certificate** with:
  - Student name, course title, hours completed, instructor name, completion date, unique ID (`PHARM-YYYY-XXXXXXXX`).
  - Landscape printable template (company green branding).
  - **View & print certificate** from the completion area and celebration modal.
  - Route: `/student/course/[courseId]/certificate` (browser Print → PDF).

### 3.3 Engagement

- **Meetings** — Book tutors or mentors; Jitsi join when scheduled.
- **Messages** — Chat threads with tutors/admins (when threads exist).
- **Notifications** — In-app bell for assignments, meetings, and events.
- **Profile** — Editable profile including country (used for currency display).
- **Streak metric** — Learning streak on dashboard.

### 3.4 Multi-currency display & payments (new)

- **NGN** is the stored price on courses (kobo/minor units).
- **Display currency** — Nigeria (geo or profile) → NGN; international users → **USD** (live FX conversion, cached).
- **Paystack** always charges **NGN** for MVP; USD users see a clear note that checkout is in Naira at the current rate.
- Geo: Vercel `x-vercel-ip-country`; profile `country` overrides when set.

---

## 4. Tutor features (implemented)

### 4.1 Course studio

- Multi-step **new course** wizard (draft creation).
- **Curriculum editor v2** — Sections, drag-and-drop order, lessons (video/article), section quizzes, assignments, resources.
- **Pricing** — NGN prices in kobo; free or paid courses.
- **Landing / basics / promo video** — Course marketing fields and uploads (R2).
- **Submit for review** — Workflow to admin; email notifications.
- **Preview** — Student-style catalog preview.
- **Course overview** — Announcements and forum management.
- **Settings** — Delete course (policy-guarded), metadata.

### 4.2 Operations

- **Assignments** — Create, grade, notify students.
- **Communication** — Messages, announcements, forums, meetings.
- **Performance** — Overview, revenue, payment sales list, reviews, students list.
- **Payouts** — Paystack bank account resolve, wallet balance, withdrawal requests.

### 4.3 Partial / planned studio pages

Some manage screens are informational or stubbed (promotions/coupons, accessibility checkboxes without save, captions without schema, film URL client-only). Core authoring path (curriculum + pricing + submit) is fully functional.

---

## 5. Mentor features (implemented)

- Dashboard with pending meeting requests and availability summary.
- **Meetings** — Accept/reject/complete; Jitsi join.
- **Profile** — Submit for admin approval before students can book (`mentorProfileStatus`, `isActive`).
- No course or payout surfaces (by design).

---

## 6. Admin features (implemented)

- **Dashboard** — KPIs, enrollment trends, course status chart, sales, workflow feed.
- **Course approvals** — Approve → published; reject with reason; emails to tutor.
- **People CRM** — Students, tutors, mentors: search, activate/deactivate, direct message, delete (with audit log writes).
- **Mentor applications** — Review queue for mentor profiles.
- **Payments** — Transaction ledger, withdrawal approve/reject (Paystack transfer), platform fee % and min withdrawal settings.
- **Messages** — Inbox and broadcast notifications.
- **Badges** — Catalog management and rules reference.
- **Course preview** — Admin read-only catalog view.

---

## 7. Technical architecture

```text
Browser (Student / Tutor / Mentor / Admin)
        │
        ▼
Next.js App Router (React Server Components + API routes)
        │
        ├── NextAuth (JWT sessions, credentials + optional Google/Apple OAuth)
        ├── Prisma ORM → PostgreSQL (Neon)
        ├── Paystack API (charge, verify, webhook, transfers)
        ├── Cloudflare R2 (lesson media, avatars, uploads)
        ├── Resend (transactional email)
        └── Hugging Face (AI quiz & course chat, optional)
```

**Security patterns**

- Role enforced per API route (`auth()` + `UserRole` checks).
- Page routes guarded by `proxy.ts` for portal prefixes (`/student`, `/tutor`, `/mentor`, `/admin`).
- Paystack webhook HMAC verification; server-side transaction re-verify on purchase completion.
- Paid course access gated by `CoursePurchase` SUCCESS before content, assignments, forum, and AI features.

**Key data models**

User, Course, CourseSection, Lesson, Enrollment, LessonProgress, CoursePurchase, CourseCertificate, CourseReview, Assignment, AssignmentSubmission, Badge, StudentBadge, MeetingRequest, Meeting, ChatThread, PlatformSettings, WithdrawalRequest, TutorPayoutAccount, CourseApprovalWorkflow, and related enums.

---

## 8. Payments & commerce flow

1. Student clicks **Buy now** on a priced course.
2. `POST /api/payments/paystack/initialize` creates a pending `CoursePurchase` with charge amount (NGN kobo) and display metadata.
3. Paystack inline popup collects payment.
4. Client calls `POST /api/payments/paystack/verify`; webhook `charge.success` also completes purchase.
5. Enrollment created or linked; student gains content access.
6. Tutor wallet credited net amount after platform fee on success.

Tutor withdrawals: request → admin approve → Paystack transfer.

---

## 9. Certificate issuance flow

1. Student completes all required lessons and clicks **Complete course**.
2. `Enrollment.status` → `COMPLETED`; `CourseCertificate` row created with stable certificate number.
3. Student sees **View & print certificate** under completion CTA and in celebration modal.
4. Certificate page renders Pharm LMS template; **Print certificate** uses browser print (landscape PDF).

Backfill script for legacy completions: `pnpm dlx tsx scripts/backfill-course-certificates.ts --apply`

---

## 10. Deployment & configuration

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL |
| `AUTH_SECRET` | NextAuth |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` / `PAYSTACK_SECRET_KEY` | Payments |
| `R2_*` | Media storage |
| `RESEND_API_KEY` / `EMAIL_FROM` | Email |
| `DEFAULT_DISPLAY_CURRENCY` / `FX_CACHE_TTL_SECONDS` / `EXCHANGERATE_API_KEY` | Multi-currency |
| `HUGGINGFACE_API_KEY` | AI features (optional) |

Recommended host: **Vercel** (geo headers for currency). Package manager: **pnpm**.

---

## 11. Quality status & known gaps

**Strengths**

- End-to-end learning, payments, approvals, and tutor payouts.
- Rich curriculum and assessment tooling.
- Certificates and multi-currency improve international readiness.

**Known gaps (prioritized)**

| Priority | Item |
|----------|------|
| High | Enforce `isActive` at login/API; pending checkout idempotency; FX API fallback |
| Medium | Student purchase history page; real catalog ratings (remove placeholder stars); notifications page |
| Medium | Certificate public verify URL; admin txn display currency fields |
| Low | Tutor studio stub pages (promotions, accessibility, captions); engagement analytics placeholders |
| Low | Automated test suite |

---

## 12. Roadmap (suggested)

- **Trust & money** — Security hardening, payment edge cases, webhook error handling.
- **Learner polish** — Purchase receipts, assignments in player, leaderboard filters.
- **Credentials** — Public certificate verification page, optional PDF server generation.
- **Enterprise** — SSO, analytics dashboards, audit log UI, formal exam/question banks.
- **International** — Paystack USD settlement when merchant account supports it.

---

## 13. Conclusion

Pharm LMS delivers a complete pharmacy-training platform: governed course publishing, paid and free enrollment, structured learning with AI aids, mentor meetings, gamification, **Paystack commerce**, **multi-currency pricing display**, and **printable completion certificates** under the Pharm LMS brand. The codebase is structured for continued delivery on security, analytics, and accreditation-focused features.

---

*Pharm LMS © 2026 — Company-owned learning platform.*
