import { getLandingContent, type LandingAudience } from "@/lib/landing-content";

function TagBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`rounded-full border px-3 py-0.5 text-sm font-semibold ${color}`}>
      {label}
    </span>
  );
}

type BlogSectionProps = {
  audience?: LandingAudience;
};

export function BlogSection({ audience = "student" }: BlogSectionProps) {
  const { blog } = getLandingContent(audience);
  const leftPosts = blog.posts.filter((p) => !p.featured);
  const rightPosts = blog.posts.filter((p) => p.featured);

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto w-[90%] lg:w-[80%] px-4 sm:px-6 lg:px-10">
        <h2 className="mb-8 font-display text-2xl font-bold text-[var(--ink-deep)] sm:text-3xl">
          {blog.title}
        </h2>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            {leftPosts.map((post) => (
              <div key={post.title} className="group flex lg:flex-row flex-col cursor-pointer gap-6 transition">
                <img
                  src={post.image}
                  alt={post.imageAlt}
                  className="h-[200px] min-w-[320px] shrink-0 object-cover"
                />
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <p className="mb-1 text-sm font-bold text-[var(--emerald)]">{post.date}</p>
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
              </div>
            ))}
          </div>

          <div className="flex lg:flex-col flex-col-reverse gap-6">
            {rightPosts.map((post) =>
              post.title ? (
                <div key={post.title} className="group cursor-pointer">
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-bold text-[var(--emerald)]">{post.date}</p>
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
                </div>
              ) : (
                <div key={post.imageAlt} className="overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.imageAlt}
                    className="h-[220px] min-w-[320px] w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
