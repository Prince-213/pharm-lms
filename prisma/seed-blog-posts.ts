import { BlogPostStatus } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";

const posts = [
  {
    slug: "three-pillars-of-patient-delight",
    title: "Three Pillars of Patient Delight",
    excerpt:
      "Patient satisfaction can be experienced viscerally, behaviourally, and reflectively. A great clinical interaction is built on trust, clarity, and follow-through.",
    coverImageUrl:
      "https://images.pexels.com/photos/7693189/pexels-photo-7693189.jpeg?auto=compress&cs=tinysrgb&w=1200",
    featured: false,
    featuredImageOnly: false,
    publishedAt: new Date("2024-11-16"),
    tags: [
      { label: "Research", color: "bg-pink-50 text-pink-600 border-pink-100" },
      {
        label: "Clinical UX",
        color: "bg-blue-50 text-blue-600 border-blue-100",
      },
    ],
    body: `
      <p>Pharmacy practice is shifting from transactional dispensing to relationship-centered care. When patients feel heard, informed, and supported, outcomes improve—and so does satisfaction.</p>
      <h2>1. Visceral delight</h2>
      <p>This is the immediate emotional response: Was the waiting area calm? Did the pharmacist make eye contact? Small signals of respect reduce anxiety, especially for patients managing chronic conditions.</p>
      <h2>2. Behavioural delight</h2>
      <p>Patients remember what you <em>did</em>: counseling on a new medication, checking for interactions, or coordinating with a prescriber. Document these actions so the care team stays aligned.</p>
      <h2>3. Reflective delight</h2>
      <p>After the visit, patients ask: “Did this help me?” Follow-up messages, refill reminders, and clear written instructions reinforce that the pharmacy is part of their health journey—not just a pickup counter.</p>
      <p>On PharmLMS, we teach these pillars through case-based modules so students practice communication before they enter high-volume settings.</p>
    `,
  },
  {
    slug: "pharmacotherapy-mapping-methods",
    title: "Pharmacotherapy Mapping Methods",
    excerpt:
      "Evidence-based principles can be applied consistently throughout the process of creating a polished therapeutic map that teams can actually use at the bedside.",
    coverImageUrl:
      "https://images.pexels.com/photos/27920699/pexels-photo-27920699.jpeg?auto=compress&cs=tinysrgb&w=1200",
    featured: false,
    featuredImageOnly: false,
    publishedAt: new Date("2024-09-24"),
    tags: [
      { label: "Research", color: "bg-pink-50 text-pink-600 border-pink-100" },
      {
        label: "Pharmacology",
        color: "bg-indigo-50 text-indigo-600 border-indigo-100",
      },
    ],
    body: `
      <p>Therapeutic mapping connects patient problems, drug mechanisms, monitoring plans, and safety nets. It is one of the most valuable skills for clinical pharmacists—and one of the hardest to teach at scale.</p>
      <h2>Start with the problem list</h2>
      <p>List active medical problems in priority order. For each problem, identify the goal of therapy (symptom control, disease modification, prevention) before selecting agents.</p>
      <h2>Layer drug–drug and drug–disease checks</h2>
      <p>Maps should highlight interactions that change monitoring frequency or contraindicate a class. Color-coding by risk level helps teams scan quickly during rounds.</p>
      <h2>Close the loop with monitoring</h2>
      <p>Every recommendation needs a metric: blood pressure, A1c, INR, renal function, or patient-reported outcomes. Without monitoring, maps become static documents instead of living care plans.</p>
    `,
  },
  {
    slug: "agile-clinical-education-usability",
    title: "Agile Development in Clinical Education and Usability",
    excerpt:
      "Agile methods aim to overcome usability barriers in traditional education, but post new threats to learning quality if teams skip instructional design fundamentals.",
    coverImageUrl:
      "https://images.pexels.com/photos/7640741/pexels-photo-7640741.jpeg?auto=compress&cs=tinysrgb&w=1200",
    featured: true,
    featuredImageOnly: false,
    publishedAt: new Date("2024-03-13"),
    tags: [
      {
        label: "Programming",
        color: "bg-amber-50 text-amber-600 border-amber-100",
      },
      { label: "Research", color: "bg-violet-50 text-violet-600 border-violet-100" },
      {
        label: "Developments",
        color: "bg-rose-50 text-rose-600 border-rose-100",
      },
    ],
    body: `
      <p>Clinical education programs are adopting shorter release cycles for modules, quizzes, and simulation updates. Borrowing agile rituals from software can help—if academic rigor stays in the loop.</p>
      <h2>Sprints with learning objectives</h2>
      <p>Each sprint should ship measurable competency gains, not just content volume. Define what learners must <em>do</em> after the sprint, then author assessments backward from that outcome.</p>
      <h2>Usability testing with real students</h2>
      <p>Five moderated sessions often reveal navigation issues that teams miss in staging. PharmLMS course analytics complement qualitative feedback by showing where learners stall or replay videos.</p>
      <h2>Definition of done</h2>
      <p>A module is not “done” until accessibility checks, citation review, and remediation paths exist. Skipping these steps creates debt that shows up as support tickets and lower completion rates.</p>
    `,
  },
  {
    slug: "modern-clinical-workspace",
    title: "",
    excerpt: "",
    coverImageUrl:
      "https://images.pexels.com/photos/32216281/pexels-photo-32216281.png?auto=compress&cs=tinysrgb&w=1200",
    featured: true,
    featuredImageOnly: true,
    publishedAt: new Date("2024-01-05"),
    tags: [],
    body: `
      <p>This featured image highlights modern clinical workspaces designed for collaborative pharmacy practice—where technology, counseling space, and team stations support safer care.</p>
    `,
  },
] as const;

export async function seedBlogPosts() {
  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      create: {
        slug: post.slug,
        title: post.title || "Modern clinical workspace",
        excerpt: post.excerpt || "A look at collaborative pharmacy environments.",
        body: post.body.trim(),
        coverImageUrl: post.coverImageUrl,
        featured: post.featured,
        featuredImageOnly: post.featuredImageOnly,
        tags: post.tags,
        status: BlogPostStatus.PUBLISHED,
        publishedAt: post.publishedAt,
      },
      update: {
        title: post.title || "Modern clinical workspace",
        excerpt: post.excerpt || "A look at collaborative pharmacy environments.",
        body: post.body.trim(),
        coverImageUrl: post.coverImageUrl,
        featured: post.featured,
        featuredImageOnly: post.featuredImageOnly,
        tags: post.tags,
        status: BlogPostStatus.PUBLISHED,
        publishedAt: post.publishedAt,
      },
    });
  }
  console.log(`Seeded ${posts.length} blog posts.`);
}

const isDirectRun = process.argv[1]?.replace(/\\/g, "/").includes("seed-blog-posts");
if (isDirectRun) {
  seedBlogPosts()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
