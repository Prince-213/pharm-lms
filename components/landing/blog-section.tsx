type BlogPost = {
  image: string;
  imageAlt: string;
  date: string;
  title: string;
  excerpt: string;
  tags: { label: string; color: string }[];
  featured?: boolean;
};

const posts: BlogPost[] = [
  {
    image:
      "https://images.pexels.com/photos/7693189/pexels-photo-7693189.jpeg?auto=compress&cs=tinysrgb&w=600",
    imageAlt: "Team collaborating in modern office — Yan Krukau on Pexels",
    date: "November 16, 2024",
    title: "Three Pillars of Patient Delight",
    excerpt:
      "Patient satisfaction can be experienced viscerally, behaviourally, and reflectively. A great clinical interaction is ...",
    tags: [
      { label: "Research", color: "bg-pink-50 text-pink-600 border-pink-100" },
      { label: "Clinical UX", color: "bg-blue-50 text-blue-600 border-blue-100" },
    ],
  },
  {
    image:
      "https://images.pexels.com/photos/27920699/pexels-photo-27920699.jpeg?auto=compress&cs=tinysrgb&w=600",
    imageAlt: "Modern pharmacy workspace with desk and computer — Pușcaș Adryan on Pexels",
    date: "September 24, 2024",
    title: "Pharmacotherapy Mapping Methods",
    excerpt:
      "Evidence-based principles can be applied consistently throughout the process of creating a polished therapeutic map...",
    tags: [
      { label: "Research", color: "bg-pink-50 text-pink-600 border-pink-100" },
      { label: "Pharmacology", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
    ],
  },
  {
    image:
      "https://images.pexels.com/photos/7640741/pexels-photo-7640741.jpeg?auto=compress&cs=tinysrgb&w=600",
    imageAlt: "Colleagues in collaborative meeting — Yan Krukau on Pexels",
    date: "March 13, 2024",
    title: "Agile Development in Clinical Education and Usability",
    excerpt:
      "Agile methods aim to overcome usability barriers in traditional education, but post new threats to learning quality.",
    tags: [
      { label: "Programming", color: "bg-amber-50 text-amber-600 border-amber-100" },
      { label: "Research", color: "bg-violet-50 text-violet-600 border-violet-100" },
      { label: "Developments", color: "bg-rose-50 text-rose-600 border-rose-100" },
    ],
    featured: true,
  },
  {
    image:
      "https://images.pexels.com/photos/32216281/pexels-photo-32216281.png?auto=compress&cs=tinysrgb&w=600",
    imageAlt: "Modern clinical office — The Ghazi on Pexels",
    date: "January 5, 2024",
    title: "",
    excerpt: "",
    tags: [],
    featured: true,
  },
];

const leftPosts = posts.filter((p) => !p.featured);
const rightPosts = posts.filter((p) => p.featured);

function TagBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`rounded-full border px-3 py-0.5 text-sm font-semibold ${color}`}>
      {label}
    </span>
  );
}

export function BlogSection() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto w-[90%] lg:w-[80%] px-4 sm:px-6 lg:px-10">
        <h2 className="mb-8 font-display text-2xl font-extrabold text-[var(--ink-deep)] sm:text-3xl">
          Our recent blogs
        </h2>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: stacked small post rows */}
          <div className="flex flex-col gap-6">
            {leftPosts.map((post) => (
              <div
                key={post.title}
                className="group flex gap-6 transition cursor-pointer"
              >
                <img
                  src={post.image}
                  alt={post.imageAlt}
                  className="h-[200px] min-w-[320px] shrink-0 object-cover"
                />
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <p className="mb-1 text-sm font-bold text-[var(--emerald)]">{post.date}</p>
                    <h3 className="font-display text-lg py-2 font-bold leading-snug text-[var(--ink-deep)] group-hover:text-[var(--emerald)] transition-colors">
                      {post.title}
                    </h3>
                    <p className="mt-1 text-base leading-relaxed text-[var(--muted-soft)] line-clamp-2">
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

          {/* Right: featured posts */}
          <div className="flex flex-col gap-6">
            {rightPosts.map((post) =>
              post.title ? (
                /* Featured post with content */
                <div
                  key={post.title}
                  className="group cursor-pointer"
                >
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-bold text-[var(--emerald)]">{post.date}</p>
                    <h3 className="font-display text-xl font-extrabold leading-snug text-[var(--ink-deep)] group-hover:text-[var(--emerald)] transition-colors">
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
                /* Featured post: image only */
                <div key={post.imageAlt} className="overflow-hidden ">
                  <img
                    src={post.image}
                    alt={post.imageAlt}
                    className="h-[220px] min-w-[320px] w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
