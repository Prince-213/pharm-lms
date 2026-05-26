export type BlogTag = {
  label: string;
  color: string;
};

export type LandingBlogPostView = {
  slug: string;
  href: string;
  image: string;
  imageAlt: string;
  date: string;
  title: string;
  excerpt: string;
  tags: BlogTag[];
  featured?: boolean;
  featuredImageOnly?: boolean;
};
