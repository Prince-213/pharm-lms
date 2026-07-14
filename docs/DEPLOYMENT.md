# Deploy Pharm LMS to AWS Amplify (Free Tier)

This guide walks you through creating a free AWS account, setting up a Neon
PostgreSQL database, and deploying this Next.js app with **AWS Amplify Hosting**.

**Recommended stack for free-tier MVP**

| Piece | Service |
|-------|---------|
| App (Next.js SSR) | AWS Amplify Hosting |
| Database | Neon PostgreSQL (free) |
| Media | Cloudflare R2 (existing) or AWS S3 |
| Payments | Paystack |
| Email | Resend |

Amplify hosts the app only — it does **not** include PostgreSQL. Neon is the
easiest free database and matches [`.env.example`](../.env.example).

> **Next.js 16 note:** Amplify’s docs officially list SSR support through
> Next.js 15. This repo is on Next.js 16 and includes
> [`amplify.yml`](../amplify.yml) plus
> [`scripts/resolve-next-symlinks.js`](../scripts/resolve-next-symlinks.js) to
> work around a known Turbopack symlink bundling issue. If Amplify still fails
> after a successful build, see [Troubleshooting](#troubleshooting) and the
> [EC2 fallback](#fallback-ec2-t3micro-free-tier).

---

## 1. Create a free AWS account

1. Open [https://aws.amazon.com/free/](https://aws.amazon.com/free/).
2. Click **Create a Free Account**.
3. Enter an email, AWS account name, and password.
4. Choose **Personal** (or Business) and fill in contact details.
5. Add a **payment method** (required even for Free Tier; AWS may place a small
   temporary authorization hold).
6. Verify your phone number.
7. Choose a support plan — select **Basic support - Free**.
8. Sign in to the [AWS Management Console](https://console.aws.amazon.com/).

**Free Tier tips**

- Amplify Hosting has a free usage allowance (build minutes + data transfer).
  Stay within Free Tier limits for a small MVP.
- Set a budget alert: Console → **Billing** → **Budgets** → create a $5 / $10
  monthly budget so you get email if spend rises.
- Prefer a region close to your users (e.g. `eu-west-1`, `us-east-1`,
  `af-south-1` if available for Amplify in your account).

---

## 2. Create a Neon PostgreSQL database

1. Sign up at [https://console.neon.tech](https://console.neon.tech).
2. Create a project (e.g. `pharm-lms`).
3. Copy the **connection string** (URI). It looks like:

   ```
   postgresql://user:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
   ```

4. Keep this as `DATABASE_URL` for Amplify and for local migrate/seed commands.

---

## 3. Push this project to GitHub

Amplify deploys from Git. If the repo is not on GitHub yet:

```bash
git remote -v
# If needed:
# git remote add origin https://github.com/<you>/pharm-lms.git
git push -u origin main
```

Use the branch you want Amplify to track (usually `main`).

---

## 4. Generate production secrets (local)

On your machine:

```bash
# Strong AUTH_SECRET (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save the output — you will paste it into Amplify as `AUTH_SECRET`.

---

## 5. Create the Amplify app

1. AWS Console → search **Amplify** → open **AWS Amplify**.
2. Click **Create new app** → **Host web app**.
3. Choose **GitHub** → authorize AWS Amplify to access your repos.
4. Select the `pharm-lms` repository and branch (`main`).
5. Amplify should detect Next.js. Confirm build settings use the repo’s
   [`amplify.yml`](../amplify.yml) (pnpm + Prisma generate + build).
6. Under **Advanced settings** / **Environment variables**, add the variables
   in the table below.
7. Click **Save and deploy**.

### Environment variables to set in Amplify

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon connection string |
| `AUTH_SECRET` | Random hex from step 4 |
| `AUTH_TRUST_HOST` | `true` |
| `AUTH_URL` | `https://<branch>.<app-id>.amplifyapp.com` (update after first deploy if needed) |
| `NEXT_PUBLIC_SITE_URL` | Same as `AUTH_URL` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_test_...` or `pk_live_...` |
| `PAYSTACK_SECRET_KEY` | `sk_test_...` or `sk_live_...` |
| `RESEND_API_KEY` | Resend API key (required for signup OTP email) |
| `EMAIL_FROM` | e.g. `Pharm LMS <noreply@yourdomain.com>` |
| `R2_ENDPOINT` | Your R2/S3 endpoint |
| `R2_REGION` | `auto` or AWS region |
| `R2_ACCESS_KEY_ID` | Storage access key |
| `R2_SECRET_ACCESS_KEY` | Storage secret |
| `R2_BUCKET_NAME` | Bucket name |
| `PG_POOL_MAX` | `5` (recommended on Amplify) |
| `DEFAULT_DISPLAY_CURRENCY` | `USD` (optional) |

Tutor/mentor curriculum uploads go **directly to R2** (presigned PUT) so large
videos are not limited by the Next.js request body. Configure bucket **CORS** to
allow `PUT` (and `GET`/`HEAD`) from your production origin, e.g.:

```json
[
  {
    "AllowedOrigins": ["https://your-production-domain.com", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Optional: `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`, `HUGGINGFACE_API_KEY`, etc.

After the first successful deploy, Amplify shows a default URL like:

`https://main.dxxxxxxxxxxxx.amplifyapp.com`

If you set `AUTH_URL` before knowing that URL, update `AUTH_URL` and
`NEXT_PUBLIC_SITE_URL` to match, then **Redeploy this version**.

---

## 6. Run database migrations (production)

Amplify build does **not** run migrations automatically. From your laptop
(with production `DATABASE_URL`):

```bash
# In the project root, with DATABASE_URL pointing at Neon:
pnpm db:migrate:deploy
```

Optional — create the first admin (change the password):

```bash
# Windows PowerShell
$env:SEED_ADMIN_EMAIL="admin@yourdomain.com"
$env:SEED_ADMIN_PASSWORD="YourStrongPasswordHere"
$env:DATABASE_URL="postgresql://..."
pnpm db:seed
```

```bash
# macOS / Linux
SEED_ADMIN_EMAIL=admin@yourdomain.com \
SEED_ADMIN_PASSWORD='YourStrongPasswordHere' \
DATABASE_URL='postgresql://...' \
pnpm db:seed
```

---

## 7. Paystack webhook

1. Open [Paystack Dashboard](https://dashboard.paystack.com/) → **Settings** →
   **API Keys & Webhooks**.
2. Set webhook URL to:

   ```
   https://<your-amplify-or-custom-domain>/api/paystack/webhook
   ```

3. Enable at least **`charge.success`**.
4. Use test keys while validating; switch to live keys for production.

---

## 8. Custom domain (optional)

1. Amplify app → **Hosting** → **Custom domains** → **Add domain**.
2. Follow DNS instructions (Route 53 or your registrar).
3. Update `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to `https://your-domain.com`.
4. Update Google/Apple OAuth redirect URIs if you use OAuth.
5. Update the Paystack webhook URL.
6. Redeploy.

---

## 9. Smoke-test checklist

- [ ] Marketing home `/` loads
- [ ] `/about`, `/contact`, `/courses`, `/validate` load
- [ ] Student signup sends OTP email (Resend)
- [ ] Login works for student / tutor / mentor / admin
- [ ] Course catalog and course detail pages load
- [ ] Paid checkout (Paystack test) completes enrollment
- [ ] Closing the Paystack popup still enrolls via webhook
- [ ] Tutor can upload a thumbnail/video (R2/S3 configured)
- [ ] Admin can open payments / withdrawals

---

## Troubleshooting

### Build succeeds but deploy fails with `EEXIST`

The symlink resolver in `amplify.yml` should fix this. Confirm the build log
shows:

```text
Resolved N symlinks, copied M packages total.
```

If it still fails, open an Amplify support case or use the [EC2 fallback](#fallback-ec2-t3micro-free-tier).

### Build output too large (> ~220 MB)

Amplify compute has a max artifact size. Large `.next/node_modules` copies can
exceed it. Options:

1. Ensure `.npmrc` has `node-linker=hoisted` (already in this repo).
2. Clear Amplify build cache and redeploy.
3. Use the EC2 fallback (no Amplify artifact limit).

### App loads but auth / DB errors

- Confirm `DATABASE_URL` includes `?sslmode=require` for Neon.
- Confirm `AUTH_SECRET`, `AUTH_URL`, and `AUTH_TRUST_HOST=true` are set.
- Confirm you ran `pnpm db:migrate:deploy` against that database.

### Signup OTP never arrives

- Set `RESEND_API_KEY` and a verified `EMAIL_FROM` domain in Resend.
- Without Resend, OTP only appears in Amplify **Hosting** → **Monitoring** /
  build/runtime logs.

### Images from storage broken

Add your public bucket hostname to `images.remotePatterns` in
[`next.config.ts`](../next.config.ts) and redeploy.

---

## Fallback: EC2 t3.micro (Free Tier)

Use this if Amplify cannot host Next.js 16 for your account.

1. EC2 → Launch instance → Amazon Linux 2023 → **t3.micro**.
2. Security group: allow **22**, **80**, **443**.
3. SSH in, install Node 22 + pnpm + nginx + certbot.
4. Clone the repo, set `.env`, then:

   ```bash
   pnpm install --frozen-lockfile
   pnpm db:migrate:deploy
   pnpm build
   pnpm exec pm2 start pnpm --name pharm-lms -- start
   ```

5. Point nginx to `http://127.0.0.1:3000` and enable HTTPS with Let’s Encrypt.
6. Keep using Neon (or create RDS PostgreSQL free tier if you prefer all-AWS DB).

---

## Handover checklist for the client

- [ ] GitHub repo access
- [ ] AWS account + Amplify app access
- [ ] Neon project access
- [ ] Paystack + Resend + R2/S3 credentials (password manager, not git)
- [ ] Production admin email/password (not the seed default)
- [ ] This document (`docs/DEPLOYMENT.md`)
- [ ] Budget alerts enabled on AWS
