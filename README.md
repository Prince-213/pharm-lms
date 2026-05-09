This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Production env (Netlify)

- **Required**: set **`AUTH_SECRET`** or legacy **`NEXTAUTH_SECRET`** (same value; must be stable across deploys and identical for Node and edge/proxy). In the Netlify UI, scope secrets for **Functions** (serverless runtime), not only Builds—otherwise `/api/auth` can see an empty secret and return `error=Configuration`.
- **Recommended**: set **`AUTH_TRUST_HOST=true`** (this repo’s `netlify.toml` sets it for builds). Auth.js needs a trusted host in production.
- **`AUTH_URL` / `NEXTAUTH_URL`**: use **only** if it matches the URL users open in the browser. If you log in at `https://main--yoursite.netlify.app` but set `AUTH_URL=https://yoursite.netlify.app`, NextAuth rewrites the request origin and sign-in can fail (CSRF / cookies). For branch deploys and previews, either point `AUTH_URL` at that exact host or **omit** `AUTH_URL`/`NEXTAUTH_URL` and rely on `AUTH_TRUST_HOST` + the real `Host` header.
- **Required**: set `DATABASE_URL`

### Google OAuth (Netlify)

Auth.js uses this callback path (default base path `/api/auth`):

`https://<exact-host-in-browser>/api/auth/callback/google`

Google returns **`redirect_uri_mismatch`** if that full URL is not listed under your OAuth client’s **Authorized redirect URIs**. The host must match what users type in the address bar: production (`https://pharm-lms.netlify.app`) and branch deploys (`https://main--pharm-lms.netlify.app`) are **different** redirect URIs—register every host you use for sign-in.

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → **APIs & Services** → **Credentials** → your **OAuth 2.0 Client ID** (Web application):

**Authorized redirect URIs** (add each line you need; no trailing slash after `google`):

- `https://pharm-lms.netlify.app/api/auth/callback/google`
- `https://main--pharm-lms.netlify.app/api/auth/callback/google` (only if you sign in from that branch URL)
- `http://localhost:3000/api/auth/callback/google` (local dev; adjust port if needed)

**Authorized JavaScript origins** (origin only, no path):

- `https://pharm-lms.netlify.app`
- `https://main--pharm-lms.netlify.app` (if used)
- `http://localhost:3000` (if used)

Env vars for this app: `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` (see Auth.js provider inference). Prefer one canonical production URL for real users so you do not maintain many Netlify preview domains in Google.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
