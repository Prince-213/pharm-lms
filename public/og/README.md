# Open Graph images

Social sharing previews (target **1200×630**). Wired in `lib/site-metadata.ts`.

Next.js file convention images (these are what crawlers actually fetch):

- `app/opengraph-image.jpg`
- `app/twitter-image.jpg`

Public fallbacks:

| File | Used for |
|------|----------|
| `default-v3.jpg` | Site-wide Open Graph / Twitter card fallback |
| `home-v3.jpg` | Homepage — listed first in metadata |

Sources are AI-authored in `scripts/og-sources/`. Resize and publish:

```bash
pnpm brand:assets
```

Brand: navy `#1e40af` / `#0b1228`, purple accent `#7a4dfc`, wordmark **PharmEdge**, CTA chip “Start learning”.
