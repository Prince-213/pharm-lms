# Repair course author roles (`repair-course-author-roles.ts`)

Course rows use `Course.mentorId` as the **instructor / course author** id. In the product model, those users should have `User.role = TUTOR`. If someone was created as `MENTOR` but owns courses, they appear on **Mentors CRM** instead of **Tutors CRM** and counts look wrong.

## Run order

1. **Backup** the database (dump or provider snapshot) before any write.
2. **Dry-run** (no writes): inspect diagnostics and the list of users that would change.

   ```bash
   pnpm exec tsx scripts/repair-course-author-roles.ts
   ```

3. **Apply** updates only if the dry-run output is expected:

   ```bash
   pnpm exec tsx scripts/repair-course-author-roles.ts --apply
   ```

4. **Verify** in the app: `/admin/tutors`, `/admin/mentors`, `/admin/dashboard` counts and CRM tables.

## What the script does

- Finds distinct `Course.mentorId` values.
- For each user: if `role === MENTOR`, sets `role` to `TUTOR` (when `--apply`).
- Skips `TUTOR` (no change), `ADMIN`, `STUDENT`, and missing users (with a log line).

## Environment

Uses `DATABASE_URL` from `.env` (same as the app). Do not run `--apply` against production without a backup.
