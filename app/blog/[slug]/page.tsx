import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { ArticleHtml } from "@/components/ui/article-html";
import { loadBlogPostBySlug } from "@/lib/landing/load-landing-data";
import { siteConfig } from "@/lib/site-metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadBlogPostBySlug(slug);
  if (!post) return { title: "Article not found" };

  return {
    title: `${post.title} · ${siteConfig.name}`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await loadBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <LandingNavbar audience="student" />
      <main className="pb-16">
        <article className="mx-auto w-[90%] max-w-3xl px-4 py-10 sm:px-6 lg:w-[80%] lg:px-10 lg:py-14">
          <Link
            href="/"
            className="text-sm font-semibold text-[var(--emerald)] hover:underline"
          >
            ← Back to home
          </Link>

          <p className="mt-6 text-sm font-bold text-[var(--emerald)]">
            {post.formattedDate}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-[var(--ink-deep)] sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--muted-soft)]">
            {post.excerpt}
          </p>

          {post.tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag.label}
                  className={`rounded-full border px-3 py-0.5 text-sm font-semibold ${tag.color}`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          ) : null}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt=""
            className="mt-8 w-full rounded-2xl object-cover shadow-[var(--shadow-3)]"
          />

          <ArticleHtml
            html={post.body}
            as="div"
            className="mt-10 prose-headings:font-display prose-headings:text-[var(--ink-deep)] prose-p:text-[var(--muted-soft)] prose-a:text-[var(--emerald)]"
          />
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}
