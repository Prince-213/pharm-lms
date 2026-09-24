# Open Graph images

Social sharing previews (target **1200×630**). Wired in `lib/site-metadata.ts`.

| File | Used for |
|------|----------|
| `default-v2.jpg` | Site-wide Open Graph / Twitter card fallback |
| `home-v2.jpg` | Homepage (`app/page.tsx`) — listed first in metadata |

Regenerate from `public/pharm_logo.webp`:

```bash
pnpm brand:assets
```

Brand: navy `#1e40af`, purple accent `#7a4dfc`, wordmark **PharmEdge**, mark from `/pharm_logo.webp`, CTA chip “Start learning”.
