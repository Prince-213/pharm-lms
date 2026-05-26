import Link from "next/link";
import { getLandingContent, type LandingAudience } from "@/lib/landing-content";
import { loadLandingBlogPosts } from "@/lib/landing/load-landing-data";

function TagBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={`rounded-full border px-3 py-0.5 text-sm font-semibold ${color}`}
    >
      {label}
    </span>
  );
}

type BlogSectionProps = {
  audience?: LandingAudience;
};

export async function BlogSection({ audience = "student" }: BlogSectionProps) {
  const { blog } = getLandingContent(audience);
  const posts = await loadLandingBlogPosts(4);
  const leftPosts = posts.filter((p) => !p.featured);
  const rightPosts = posts.filter((p) => p.featured);

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto w-[90%] px-4 sm:px-6 lg:w-[80%] lg:px-10">
        <h2 className="mb-8 font-display text-2xl font-bold text-[var(--ink-deep)] sm:text-3xl">
          {blog.title}
        </h2>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-[var(--muted-soft)]">
            Blog articles will appear here once published.
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              {leftPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={post.href}
                  className="group flex flex-col gap-6 transition lg:flex-row"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.image}
                    alt={post.imageAlt}
                    className="h-[200px] min-w-0 shrink-0 object-cover lg:min-w-[320px] lg:w-[320px]"
                  />
                  <div className="flex flex-col justify-between py-1">
                    <div>
                      <p className="mb-1 text-sm font-bold text-[var(--emerald)]">
                        {post.date}
                      </p>
                      <h3 className="font-display py-2 text-lg font-bold leading-snug text-[var(--ink-deep)] transition-colors group-hover:text-[var(--emerald)]">
                        {post.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-base leading-relaxed text-[var(--muted-soft)]">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <TagBadge key={tag.label} {...tag} />
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex flex-col-reverse gap-6 lg:flex-col">
              {rightPosts.map((post) =>
                post.featuredImageOnly ? (
                  <Link
                    key={post.slug}
                    href={post.href}
                    className="overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image}
                      alt={post.imageAlt}
                      className="h-[220px] min-w-0 w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </Link>
                ) : (
                  <Link
                    key={post.slug}
                    href={post.href}
                    className="group"
                  >
                    <div className="flex flex-col gap-3">
                      <p className="text-sm font-bold text-[var(--emerald)]">
                        {post.date}
                      </p>
                      <h3 className="font-display text-xl font-bold leading-snug text-[var(--ink-deep)] transition-colors group-hover:text-[var(--emerald)]">
                        {post.title}
                      </h3>
                      <p className="text-base leading-relaxed text-[var(--muted-soft)]">
                        {post.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.map((tag) => (
                          <TagBadge key={tag.label} {...tag} />
                        ))}
                      </div>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
