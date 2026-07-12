export type AudiencePageContent = {
  slug: "teach" | "become-a-mentor";
  breadcrumb: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroHighlight: string;
  heroImage: string;
  heroImageAlt: string;
  statCard: {
    value: string;
    title: string;
    body: string;
  };
  valueTitleLine1: string;
  valueTitleLine2: string;
  valueHighlight: string;
  valueIntro: string;
  features: { icon: string; title: string; body: string }[];
  valueImage: string;
  valueImageAlt: string;
  ctaHeadline: string;
  ctaSubtext: string;
  loginHref: string;
  loginLabel: string;
  signupHref: string;
  signupLabel: string;
};

export const teachPageContent: AudiencePageContent = {
  slug: "teach",
  breadcrumb: "Teach on PharmLMS",
  heroTitleLine1: "Turn Your Expertise Into",
  heroTitleLine2: "Courses That",
  heroHighlight: "Inspire Learners",
  heroImage: "/assets/tutor.jpg",
  heroImageAlt: "Pharmacy educator teaching on PharmLMS",
  statCard: {
    value: "100+",
    title: "Course topics",
    body: "Publish pharmacy courses on Africa's first pharmacy-specific LMS — reach practitioners across the continent with clinical content built for real African contexts.",
  },
  valueTitleLine1: "Everything You Need to",
  valueTitleLine2: "Build and",
  valueHighlight: "Publish Courses",
  valueIntro:
    "PharmLMS gives tutors a structured course builder, video uploads, curriculum tools, and a student audience ready to learn. Share your expertise and grow your teaching brand on one platform.",
  features: [
    {
      icon: "/assets/instructors.svg",
      title: "Course builder & curriculum",
      body: "Plan sections, upload lectures, add quizzes and resources — all in a guided workflow inspired by leading learning platforms.",
    },
    {
      icon: "/assets/career.svg",
      title: "Reach pharmacy professionals",
      body: "Connect with pharmacists and students across Africa who are actively looking for clinical, data, and digital health skills.",
    },
    {
      icon: "/assets/call.svg",
      title: "Earn on your terms",
      body: "Set pricing, track enrollments, and manage payouts when your courses go live after platform review.",
    },
  ],
  valueImage: "/assets/about.png",
  valueImageAlt: "Tutor creating course content",
  ctaHeadline: "Ready to start teaching?",
  ctaSubtext: "Log in to your tutor dashboard to create courses, or sign up if you are new to PharmLMS.",
  loginHref: "/tutor/login",
  loginLabel: "Log in as tutor",
  signupHref: "/tutor/signup",
  signupLabel: "Create tutor account",
};

export const mentorPageContent: AudiencePageContent = {
  slug: "become-a-mentor",
  breadcrumb: "Mentor on PharmLMS",
  heroTitleLine1: "Guide the Next Generation of",
  heroTitleLine2: "Pharmacy",
  heroHighlight: "Leaders",
  heroImage: "/assets/mentor.jpg",
  heroImageAlt: "Pharmacy mentor supporting a learner",
  statCard: {
    value: "1:1",
    title: "Mentorship",
    body: "Offer structured guidance, career roadmaps, and session-based support for pharmacists moving into clinical, data, and digital health roles.",
  },
  valueTitleLine1: "Share Your Insight and",
  valueTitleLine2: "Make an",
  valueHighlight: "Impact",
  valueIntro:
    "Mentors on PharmLMS help learners navigate exams, career transitions, and professional growth. Set your availability, manage sessions, and support pharmacists across Africa on your schedule.",
  features: [
    {
      icon: "/assets/call.svg",
      title: "Flexible scheduling",
      body: "Accept mentorship requests and host sessions when it works for you — built for busy practicing pharmacists.",
    },
    {
      icon: "/assets/instructors.svg",
      title: "Career & exam guidance",
      body: "Support learners with program research, licensing prep, and the soft skills needed to thrive in modern pharmacy practice.",
    },
    {
      icon: "/assets/career.svg",
      title: "Verified mentor profile",
      body: "Apply once, get reviewed by our team, and become visible to students once approved — quality mentorship learners can trust.",
    },
  ],
  valueImage: "/assets/about.png",
  valueImageAlt: "Mentor guiding a pharmacy student",
  ctaHeadline: "Ready to mentor on PharmLMS?",
  ctaSubtext: "Log in to your mentor portal to manage sessions, or apply to become a mentor if you are new.",
  loginHref: "/mentor/login",
  loginLabel: "Log in as mentor",
  signupHref: "/mentor/signup",
  signupLabel: "Apply to mentor",
};

export function getAudiencePageContent(
  slug: AudiencePageContent["slug"],
): AudiencePageContent {
  return slug === "teach" ? teachPageContent : mentorPageContent;
}

const audienceLoginByPath: Record<string, string> = {
  "/teach": teachPageContent.loginHref,
  "/become-a-mentor": mentorPageContent.loginHref,
};

export function getHeaderLoginHref(pathname: string): string {
  return audienceLoginByPath[pathname] ?? "/student/login";
}
