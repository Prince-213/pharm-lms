export type AudienceIconName =
  | "book"
  | "users"
  | "wallet"
  | "calendar"
  | "graduation"
  | "shield"
  | "userPlus"
  | "presentation"
  | "clipboard"
  | "file"
  | "linkedin"
  | "chat"
  | "medal"
  | "check"
  | "clock"
  | "lightbulb"
  | "video"
  | "handshake"
  | "chalkboard"
  | "path";

export type AudienceFeature = {
  icon: AudienceIconName;
  title: string;
  body: string;
  href: string;
};

export type AudienceStep = {
  icon: AudienceIconName;
  title: string;
  body: string;
};

export type AudienceChecklistItem = {
  title: string;
  body: string;
};

export type AudienceFaq = {
  question: string;
  answer: string;
};

export type AudienceStat = {
  value: string;
  label: string;
};

export type AudienceWhoItem = {
  icon: AudienceIconName;
  title: string;
  body: string;
};

export type AudienceRhythmItem = {
  title: string;
  body: string;
};

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
  features: AudienceFeature[];
  valueImage: string;
  valueImageAlt: string;
  quote: string;
  causeHeadline: string;
  stepsEyebrow: string;
  stepsTitle: string;
  steps: AudienceStep[];
  checklistTitle: string;
  checklistLead: string;
  checklist: AudienceChecklistItem[];
  faqs: AudienceFaq[];
  peopleMode: "tutors" | "mentor-photo";
  peopleImage?: string;
  peopleImageAlt?: string;
  mentorBandCaption?: string;
  ctaHeadline: string;
  ctaSubtext: string;
  ctaImage: string;
  ctaImageAlt: string;
  stats: AudienceStat[];
  whoEyebrow: string;
  whoTitle: string;
  whoLead: string;
  who: AudienceWhoItem[];
  whoImage: string;
  whoImageAlt: string;
  rhythmEyebrow: string;
  rhythmTitle: string;
  rhythmLead: string;
  rhythmImage: string;
  rhythmImageAlt: string;
  rhythmItems: AudienceRhythmItem[];
  quoteBand: string;
  quoteBandBy: string;
  quoteBandImage: string;
  quoteBandImageAlt: string;
  loginHref: string;
  loginLabel: string;
  signupHref: string;
  signupLabel: string;
};

export const teachPageContent: AudiencePageContent = {
  slug: "teach",
  breadcrumb: "Teach",
  heroTitleLine1: "Turn Your Expertise Into",
  heroTitleLine2: "Courses That",
  heroHighlight: "Inspire Learners",
  heroImage: "/assets/marketing/teach-hero.jpg",
  heroImageAlt: "Tutors mapping a lesson on a whiteboard",
  statCard: {
    value: "100+",
    title: "Course topics",
    body: "Publish pharmacy courses on Africa's first pharmacy-specific LMS — reach practitioners across the continent with clinical content built for real African contexts.",
  },
  valueTitleLine1: "Everything You Need to",
  valueTitleLine2: "Build and",
  valueHighlight: "Publish Courses",
  valueIntro:
    "PharmEdge gives tutors a structured course builder, video uploads, curriculum tools, and a student audience ready to learn. Share your expertise and grow your teaching brand on one platform.",
  features: [
    {
      icon: "book",
      title: "Course builder & curriculum",
      body: "Plan sections, upload lectures, add quizzes and resources — all in a guided workflow inspired by leading learning platforms.",
      href: "/tutor/signup",
    },
    {
      icon: "users",
      title: "Reach pharmacy professionals",
      body: "Connect with pharmacists and students across Africa who are actively looking for clinical, data, and digital health skills.",
      href: "/courses",
    },
    {
      icon: "wallet",
      title: "Earn on your terms",
      body: "Set pricing, track enrollments, and manage payouts when your courses go live after platform review.",
      href: "/tutor/signup",
    },
  ],
  valueImage: "/assets/marketing/teach-workflow.jpg",
  valueImageAlt: "Tutor preparing a lesson from notes and a live session",
  quote:
    "Every course is reviewed before it goes live. Learners see your work only when it is ready.",
  causeHeadline: "We do this so pharmacists can teach pharmacists.",
  stepsEyebrow: "Playbook",
  stepsTitle: "How it works on PharmEdge.",
  steps: [
    {
      icon: "userPlus",
      title: "Create your tutor account",
      body: "Apply with your pharmacy background. Every tutor is reviewed before they can publish.",
    },
    {
      icon: "presentation",
      title: "Build the curriculum",
      body: "Sections, lectures, quizzes and resources sit in one guided builder — no separate tools to stitch together.",
    },
    {
      icon: "shield",
      title: "Platform review",
      body: "We check the course before learners see it, so the catalogue stays clinically grounded.",
    },
    {
      icon: "wallet",
      title: "Set your price and earn",
      body: "You choose the price. Payouts follow after the course is live and has passed review.",
    },
  ],
  checklistTitle: "What publishing includes",
  checklistLead:
    "The same standards for every tutor who publishes on PharmEdge.",
  checklist: [
    {
      title: "Every course is reviewed before it goes live",
      body: "Learners only see work that has passed platform review.",
    },
    {
      title: "You set the price",
      body: "Price each course yourself. The catalogue shows what you choose.",
    },
    {
      title: "A pharmacy audience across Africa",
      body: "Reach practitioners looking for clinical, data and digital health skills.",
    },
    {
      title: "Payouts after platform review",
      body: "Earnings follow once your course is live.",
    },
  ],
  faqs: [
    {
      question: "How do I start publishing?",
      answer:
        "Create a tutor account, wait for review, then use the course builder to add sections, lectures and quizzes. Learners see the course only after it is approved.",
    },
    {
      question: "Who can see my course before it is live?",
      answer:
        "Only you and the review team. The public catalogue does not list a course until it has passed review.",
    },
    {
      question: "How do payouts work?",
      answer:
        "You set the price on each course. Payouts are processed after the course is live and has passed platform review.",
    },
    {
      question: "Do I need studio equipment?",
      answer:
        "No. A laptop, clear audio and clinically accurate content are enough to start. The builder is designed for practising pharmacists, not production studios.",
    },
    {
      question: "Can I teach while working full-time?",
      answer:
        "Yes. The builder is meant for evenings and weekends. Outline a module after a shift, record when you have a quiet hour, and submit when the course is ready for review.",
    },
    {
      question: "What can I publish on PharmEdge?",
      answer:
        "Courses that help pharmacists move from dispensing into clinical, data, pharmacovigilance, and digital health work. Every course is reviewed against that bar before it is listed.",
    },
    {
      question: "How long does platform review take?",
      answer:
        "Review starts once you submit. We check structure, accuracy, and whether the course belongs on a pharmacy pathway. You hear from the team before anything goes live.",
    },
    {
      question: "Can I update a course after it is live?",
      answer:
        "Yes. You can revise lectures and quizzes from the tutor dashboard. Material changes go through review again so learners always see a checked version.",
    },
  ],
  peopleMode: "tutors",
  ctaHeadline: "Ready to start teaching?",
  ctaSubtext:
    "Log in to your tutor dashboard to create courses, or sign up if you are new to PharmEdge.",
  ctaImage: "/assets/marketing/teach-cta.jpg",
  ctaImageAlt: "Educator standing at a chalkboard after a teaching session",
  stats: [
    { value: "1", label: "Guided course builder" },
    { value: "0", label: "Studio required" },
    { value: "4", label: "Steps from apply to earn" },
    { value: "Africa", label: "Learners across the continent" },
  ],
  whoEyebrow: "Who teaches",
  whoTitle: "Built for pharmacists who already explain the work.",
  whoLead:
    "You do not need a production studio. You need a topic you can teach well, and the hours to put it in the builder.",
  who: [
    {
      icon: "chalkboard",
      title: "Practising pharmacists",
      body: "You still have a shift pattern. Teach the module you wish someone had recorded for you.",
    },
    {
      icon: "lightbulb",
      title: "Specialists with a niche",
      body: "Pharmacovigilance, informatics, data, clinical pharmacy — publish the slice you actually practise.",
    },
    {
      icon: "presentation",
      title: "Workshop educators",
      body: "If you already run in-person sessions, the builder is how those sessions reach learners you will never meet in a room.",
    },
  ],
  whoImage: "/assets/marketing/teach-who.jpg",
  whoImageAlt: "Tutors in a working session around a shared table",
  rhythmEyebrow: "A week in the work",
  rhythmTitle: "Teaching fits around the job you already have.",
  rhythmLead:
    "PharmEdge is not a second full-time role. It is a place to turn the explanations you already give into a course pharmacists can finish.",
  rhythmImage: "/assets/marketing/teach-rhythm.jpg",
  rhythmImageAlt: "Tutor preparing a lecture on a laptop at home",
  rhythmItems: [
    {
      title: "Outline after a shift",
      body: "Sketch sections and learning outcomes while the clinic example is still in your head.",
    },
    {
      title: "Record on a laptop",
      body: "A quiet hour, clear audio, and one pharmacy scenario per lecture is enough to start.",
    },
    {
      title: "Add quizzes and files",
      body: "The builder holds lectures, questions, and resources in the same curriculum — no extra tools to stitch.",
    },
    {
      title: "Submit for review",
      body: "Learners see the course only after it is checked. You keep working on the next module in the meantime.",
    },
  ],
  quoteBand:
    "Tutors on PharmEdge teach the course they wish they had when they left the dispensing bench.",
  quoteBandBy: "PharmEdge · Teach",
  quoteBandImage: "/assets/marketing/teach-quote.jpg",
  quoteBandImageAlt: "Teaching team agreeing the next module around a table",
  loginHref: "/tutor/login",
  loginLabel: "Log in as tutor",
  signupHref: "/tutor/signup",
  signupLabel: "Create tutor account",
};

export const mentorPageContent: AudiencePageContent = {
  slug: "become-a-mentor",
  breadcrumb: "Mentor",
  heroTitleLine1: "Guide the Next Generation of",
  heroTitleLine2: "Pharmacy",
  heroHighlight: "Leaders",
  heroImage: "/assets/marketing/mentor-hero.jpg",
  heroImageAlt: "Mentor and learner agreeing a working plan",
  statCard: {
    value: "1:1",
    title: "Mentorship",
    body: "Offer structured guidance, career roadmaps, and session-based support for pharmacists moving into clinical, data, and digital health roles.",
  },
  valueTitleLine1: "Share Your Insight and",
  valueTitleLine2: "Make an",
  valueHighlight: "Impact",
  valueIntro:
    "Mentors on PharmEdge help learners navigate exams, career transitions, and professional growth. Set your availability, manage sessions, and support pharmacists across Africa on your schedule.",
  features: [
    {
      icon: "calendar",
      title: "Flexible scheduling",
      body: "Accept mentorship requests and host sessions when it works for you — built for busy practicing pharmacists.",
      href: "/mentor/signup",
    },
    {
      icon: "graduation",
      title: "Career & exam guidance",
      body: "Support learners with program research, licensing prep, and the soft skills needed to thrive in modern pharmacy practice.",
      href: "/mentor/signup",
    },
    {
      icon: "shield",
      title: "Verified mentor profile",
      body: "Apply once, get reviewed by our team, and become visible to students once approved — quality mentorship learners can trust.",
      href: "/mentor/signup",
    },
  ],
  valueImage: "/assets/marketing/mentor-session.jpg",
  valueImageAlt: "Mentor and learner in a working session",
  quote:
    "Mentors are reviewed before learners can book. Quality guidance pharmacists can trust.",
  causeHeadline: "We do this so the next pharmacist does not move alone.",
  stepsEyebrow: "Playbook",
  stepsTitle: "How mentorship works on PharmEdge.",
  steps: [
    {
      icon: "userPlus",
      title: "Apply to mentor",
      body: "Tell us your practice area and how you want to help learners moving beyond dispensing.",
    },
    {
      icon: "shield",
      title: "Get reviewed",
      body: "Our team approves mentors before anyone can book, so learners know who they are sitting with.",
    },
    {
      icon: "calendar",
      title: "Set your availability",
      body: "Accept requests and host sessions around a full-time job.",
    },
    {
      icon: "users",
      title: "Guide pharmacists",
      body: "Portfolio, CV, exams and interviews — on a schedule you control.",
    },
  ],
  checklistTitle: "What a session can cover",
  checklistLead:
    "Agree the focus when you accept. These are the conversations learners ask for most.",
  checklist: [
    {
      title: "Portfolio",
      body: "Shape a project trail that hiring managers can actually read.",
    },
    {
      title: "CV",
      body: "Translate dispensing experience into clinical and data roles.",
    },
    {
      title: "LinkedIn",
      body: "A profile that reads as a pharmacist moving into decision-making.",
    },
    {
      title: "Interviews",
      body: "Practice the conversations for analyst and informatics roles.",
    },
    {
      title: "Exams",
      body: "Licensing and programme prep with someone who has been through it.",
    },
  ],
  faqs: [
    {
      question: "How do learners book a session?",
      answer:
        "Approved mentors appear to learners, who request times you have marked available. You accept or decline from the mentor portal.",
    },
    {
      question: "What can a session cover?",
      answer:
        "Portfolio, CV, LinkedIn, interviews and exams. You agree the focus when you accept the request.",
    },
    {
      question: "How are mentors approved?",
      answer:
        "You apply once. Our team reviews your background before learners can book. Quality guidance pharmacists can trust.",
    },
    {
      question: "Can I mentor while working full-time?",
      answer:
        "Yes. Scheduling is built for practising pharmacists. You only appear for the hours you mark as open.",
    },
    {
      question: "How long is a typical session?",
      answer:
        "Most sessions are a focused hour. You agree the topic when you accept — portfolio, CV, LinkedIn, interviews, or exams — so the time is spent on one problem, not a tour of everything.",
    },
    {
      question: "Do I choose who I sit with?",
      answer:
        "Learners request times you have marked available. You accept or decline from the mentor portal. You are not assigned a caseload you did not agree to.",
    },
    {
      question: "What if I need to cancel?",
      answer:
        "Life on a shift pattern moves. Decline or reschedule from the portal as soon as you know. Learners book against hours you still have open.",
    },
    {
      question: "Is mentoring a second job?",
      answer:
        "No. Mark the evenings or weekend slots you can keep. Mentorship on PharmEdge is built to sit beside practice, not replace it.",
    },
  ],
  peopleMode: "mentor-photo",
  peopleImage: "/assets/marketing/mentor-people.jpg",
  peopleImageAlt: "Mentor in a working studio with their team",
  mentorBandCaption:
    "Mentors are reviewed before learners can book. Quality guidance pharmacists can trust.",
  ctaHeadline: "Ready to mentor?",
  ctaSubtext:
    "Log in to your mentor portal to manage sessions, or apply to become a mentor if you are new.",
  ctaImage: "/assets/marketing/mentor-cta.jpg",
  ctaImageAlt: "Mentor and learner working through a career plan together",
  stats: [
    { value: "1:1", label: "Sessions, not lectures" },
    { value: "Your hours", label: "Mark only what a shift allows" },
    { value: "Reviewed", label: "Approved before anyone can book" },
    { value: "5", label: "Topics learners ask for most" },
  ],
  whoEyebrow: "Who mentors",
  whoTitle: "For pharmacists who already made the move.",
  whoLead:
    "Learners do not need another lecture. They need someone who has sat in the role they are trying to reach.",
  who: [
    {
      icon: "handshake",
      title: "Pharmacists who changed path",
      body: "You left dispensing for clinical, data, or digital health work. That map is what a learner cannot get from a slide deck.",
    },
    {
      icon: "path",
      title: "Specialists in the next role",
      body: "Informatics, pharmacovigilance, analysis — sit with people aiming at the job you already do.",
    },
    {
      icon: "users",
      title: "Seniors guiding juniors",
      body: "If you already review CVs and run mock interviews at work, PharmEdge is the same conversation on a calendar you control.",
    },
  ],
  whoImage: "/assets/marketing/mentor-who.jpg",
  whoImageAlt: "Mentor and learner in a one-to-one conversation",
  rhythmEyebrow: "A week in the work",
  rhythmTitle: "Mentoring on a calendar you actually keep.",
  rhythmLead:
    "The session is short. The job is to leave a next step the learner can take without you in the room.",
  rhythmImage: "/assets/marketing/mentor-rhythm.jpg",
  rhythmImageAlt: "Mentor working through a plan with a small group",
  rhythmItems: [
    {
      title: "Mark the hours that fit",
      body: "Open only the evenings or weekend slots a full-time job can hold. You do not appear for the rest.",
    },
    {
      title: "Accept a request",
      body: "See who is asking and what they want to cover. Accept, decline, or suggest another time from the portal.",
    },
    {
      title: "Agree the focus",
      body: "Portfolio, CV, LinkedIn, interviews, or exams — pick one so the hour is a working session, not a tour.",
    },
    {
      title: "Leave a next step",
      body: "The value is the map after you log off: what to fix, what to send, and what to practise before the next sit-down.",
    },
  ],
  quoteBand: "The session is short. The map it leaves behind is not.",
  quoteBandBy: "PharmEdge · Mentor",
  quoteBandImage: "/assets/marketing/mentor-quote.jpg",
  quoteBandImageAlt: "Mentor listening through a working discussion",
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

export type MarketingAuthCta = {
  loginHref: string;
  loginLabel: string;
  signupHref: string;
  signupLabel: string;
};

export const studentAuthCtas: MarketingAuthCta = {
  loginHref: "/student/login",
  loginLabel: "Log in",
  signupHref: "/student/signup",
  signupLabel: "Sign up",
};

const audienceAuthByPath: Record<string, MarketingAuthCta> = {
  "/teach": {
    loginHref: teachPageContent.loginHref,
    loginLabel: "Tutor login",
    signupHref: teachPageContent.signupHref,
    signupLabel: "Create tutor account",
  },
  "/become-a-mentor": {
    loginHref: mentorPageContent.loginHref,
    loginLabel: "Mentor login",
    signupHref: mentorPageContent.signupHref,
    signupLabel: "Apply to mentor",
  },
};

export function getHeaderAuthCtas(pathname: string): MarketingAuthCta {
  return (
    audienceAuthByPath[pathname] ?? {
      loginHref: studentAuthCtas.loginHref,
      loginLabel: "Login",
      signupHref: studentAuthCtas.signupHref,
      signupLabel: "Sign up",
    }
  );
}

export function getHeaderLoginHref(pathname: string): string {
  return getHeaderAuthCtas(pathname).loginHref;
}
