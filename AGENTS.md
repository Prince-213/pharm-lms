<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
#
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Tooling

Use **pnpm** for this repo. For one-off CLI runs (e.g. Prisma, Biome), prefer `pnpm dlx <pkg> ...` over `npx`. Local scripts: `pnpm run <script>`.

## UI conventions

- **shadcn/ui** with preset `b69Dpf8PnE` (`radix-vega` style). Primitives in `components/ui/`.
- **Brand tokens** in `app/pharm-brand.css` — navy primary `#1e40af`, purple accent `#7a4dfc`.
- **Dashboard shells** use shadcn Sidebar (`components/layout/`). Nav config: `components/layout/nav/portal-nav-config.ts`.
- Cursor rules: `.cursor/rules/nextjs-16.mdc`, `shadcn-ui.mdc`, `pharm-design-tokens.mdc`.
