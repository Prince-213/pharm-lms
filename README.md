# Pharm LMS

Pharmacy learning platform built with Next.js (App Router), Prisma, PostgreSQL, and Paystack. Roles: **student**, **tutor**, **mentor**, and **admin**.

## Stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Database:** PostgreSQL (Neon recommended) via Prisma 7
- **Auth:** Auth.js (NextAuth v5) — credentials + optional Google/Apple OAuth
- **Payments:** Paystack (NGN charges; USD display for non-Nigeria visitors)
- **Media:** Cloudflare R2 (optional)
- **Email:** Resend (signup OTP)
- **Lint/format:** Biome

## Prerequisites

- Node.js 22+
- pnpm 9+
- PostgreSQL database URL

## Setup

1. Clone and install:

   ```bash
   pnpm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

   Required for local dev: `DATABASE_URL`, `AUTH_SECRET`. See `.env.example` for Paystack, R2, OAuth, and `AUTH_URL` / `NEXT_PUBLIC_SITE_URL` (Open Graph).

3. Apply schema and seed (optional):

   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

4. Run the dev server:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|--------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm lint` | Biome check |
| `pnpm test` | Unit tests (Node test runner) |
| `pnpm db:migrate` | Prisma migrate dev |
| `pnpm db:seed` | Seed demo data |
| `pnpm db:generate` | Regenerate Prisma client |

## Paystack webhooks

Point Paystack to:

`https://<your-domain>/api/paystack/webhook`

Set `PAYSTACK_SECRET_KEY` in production. Webhook signatures are verified with HMAC SHA512.

## Project layout

- `app/` — routes (student, tutor, mentor, admin, public catalogue)
- `app/api/` — API routes (payments, AI, media, meetings)
- `lib/` — domain logic (currency, payments, auth helpers)
- `prisma/` — schema and migrations
- `proxy.ts` — role-based route protection (pages only; API routes enforce auth per handler)
- `components/` — UI by area

## Currency display

Catalog prices are stored in **NGN**. Students in Nigeria (geo header or profile country) see NGN; others see **USD** (converted via FX). Checkout always charges NGN through Paystack.

## CI

GitHub Actions runs lint, Prisma validate, unit tests, and `next build` on push/PR to `main` or `master`.

## Security notes

- Deactivated users (`isActive: false`) cannot sign in; existing JWTs are cleared on refresh.
- AI routes are rate-limited per user (in-memory; per instance).
- OAuth providers use `allowDangerousEmailAccountLinking` for account recovery — review before production if you need stricter linking.

## License

Private — all rights reserved unless otherwise agreed with the project owner.
