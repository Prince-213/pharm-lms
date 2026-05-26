export type LandingAudience = "student" | "mentor" | "instructor";

/**
 * Default demo video shown when a hero "Watch Demo" CTA is clicked.
 * Override per-audience in the `landingContent` map below if needed.
 * The `WatchDemoButton` auto-converts youtu.be / youtube.com URLs into
 * embeddable form with autoplay.
 */
const DEFAULT_HERO_DEMO_VIDEO_URL =
  "https://youtu.be/aVVsHGtkO7I?si=SlX8YcnpH13QBbv4";

export type ServiceIconKey =
  | "FlaskConical"
  | "Stethoscope"
  | "ShieldCheck"
  | "Users"
  | "Calendar"
  | "Video"
  | "BarChart3"
  | "Wallet"
  | "BookOpen"
  | "MessageCircle";

export type HeroBadgeIcon =
  | "BookOpen"
  | "Briefcase"
  | "Lightbulb"
  | "Users"
  | "Calendar"
  | "Video"
  | "BarChart3"
  | "Wallet";

export type HeroHeadlineLine = {
  before?: string;
  highlight: string;
  after?: string;
};

export type LandingHeroContent = {
  headline: HeroHeadlineLine[];
  subcopy: string;
  image: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  /**
   * Optional demo video shown when the secondary CTA is clicked. Accepts a
   * direct video URL (mp4/webm) or a YouTube/Vimeo embed URL. When set, the
   * secondary CTA opens a full-screen player instead of navigating.
   */
  demoVideoUrl?: string;
  badges: { icon: HeroBadgeIcon; label: string; imageSrc?: string }[];
};

export type LandingServiceCard = {
  icon: ServiceIconKey;
  title: string;
  description: string;
  highlighted: boolean;
};

export type LandingProgramCard = {
  image: string;
  imageAlt: string;
  category: string;
  title: string;
  description: string;
  rating: number;
  reviewCount: number;
  instructor: { name: string; avatar: string; enrolled: number };
  price: number;
  duration: string;
};

export type LandingPersonCard = {
  name: string;
  title: string;
  bio: string;
  avatar: string;
};

export type LandingTestimonial = {
  quote: string;
  name: string;
  role: string;
  avatar: string;
};

export type LandingBlogPost = {
  image: string;
  imageAlt: string;
  date: string;
  title: string;
  excerpt: string;
  tags: { label: string; color: string }[];
  featured?: boolean;
};

export type LandingPageContent = {
  navbar: {
    searchPlaceholder: string;
    signInHref: string;
    signUpHref: string;
    signUpLabel: string;
  };
  hero: LandingHeroContent;
  services: {
    eyebrow: string;
    titleLines: [string, string];
    groups: LandingServiceCard[][];
  };
  programs: {
    eyebrow: string;
    title: string;
    description: string;
    pages: LandingProgramCard[][];
    cta: { label: string; href: string };
  };
  people: {
    eyebrow: string;
    title: string;
    description: string;
    members: LandingPersonCard[];
  };
  testimonials: LandingTestimonial[];
  blog: {
    title: string;
    posts: LandingBlogPost[];
  };
};

const studentServices: LandingServiceCard[][] = [
  [
    {
      icon: "FlaskConical",
      title: "Pharmaceutical Sciences",
      description:
        "Lessons on drug chemistry and formulation that cover the most recent developments.",
      highlighted: true,
    },
    {
      icon: "Stethoscope",
      title: "Clinical Pharmacy",
      description:
        "Classes in clinical practice that cover the most recent advancements in patient care.",
      highlighted: false,
    },
    {
      icon: "ShieldCheck",
      title: "Drug Safety & Pharmacovigilance",
      description:
        "Drug safety courses that cover the most recent regulatory trends and reporting.",
      highlighted: false,
    },
  ],
  [
    {
      icon: "FlaskConical",
      title: "Pharmacokinetics",
      description:
        "In-depth modules on drug absorption, distribution, metabolism and excretion.",
      highlighted: true,
    },
    {
      icon: "Stethoscope",
      title: "Therapeutics Management",
      description:
        "Evidence-based therapeutic decision-making for complex patient cases.",
      highlighted: false,
    },
    {
      icon: "ShieldCheck",
      title: "Medication Safety",
      description:
        "Best practices for identifying and preventing medication errors in clinical settings.",
      highlighted: false,
    },
  ],
  [
    {
      icon: "FlaskConical",
      title: "Compounding Practice",
      description:
        "Hands-on modules covering sterile and non-sterile compounding techniques.",
      highlighted: true,
    },
    {
      icon: "Stethoscope",
      title: "Pharmacy Law & Ethics",
      description:
        "Regulatory frameworks, ethical principles and professional responsibility.",
      highlighted: false,
    },
    {
      icon: "ShieldCheck",
      title: "Health Informatics",
      description:
        "Digital tools and data systems shaping modern pharmacy practice.",
      highlighted: false,
    },
  ],
];

const mentorServices: LandingServiceCard[][] = [
  [
    {
      icon: "Users",
      title: "1:1 Mentorship Sessions",
      description:
        "Schedule focused sessions for career coaching, residency prep, and clinical growth.",
      highlighted: true,
    },
    {
      icon: "Calendar",
      title: "Career Roadmaps",
      description:
        "Help mentees plan rotations, licensure steps, and long-term pharmacy career paths.",
      highlighted: false,
    },
    {
      icon: "MessageCircle",
      title: "Async Guidance",
      description:
        "Review CVs, personal statements, and interview prep on your own timeline.",
      highlighted: false,
    },
  ],
  [
    {
      icon: "BookOpen",
      title: "Residency Prep",
      description:
        "Support students through application strategy, program fit, and interview readiness.",
      highlighted: true,
    },
    {
      icon: "Stethoscope",
      title: "Clinical Coaching",
      description:
        "Share real-world practice insights on patient care, therapeutics, and ward rounds.",
      highlighted: false,
    },
    {
      icon: "ShieldCheck",
      title: "Professional Development",
      description:
        "Guide mentees on leadership, board exams, and transitioning into practice.",
      highlighted: false,
    },
  ],
];

const instructorServices: LandingServiceCard[][] = [
  [
    {
      icon: "Video",
      title: "Course Builder",
      description:
        "Create structured pharmacy courses with video lessons, quizzes, and downloadable resources.",
      highlighted: true,
    },
    {
      icon: "BarChart3",
      title: "Learner Analytics",
      description:
        "Track enrollments, completion rates, and engagement to improve your content.",
      highlighted: false,
    },
    {
      icon: "Wallet",
      title: "Earn on Your Terms",
      description:
        "Set pricing, run promotions, and grow revenue as your audience scales.",
      highlighted: false,
    },
  ],
  [
    {
      icon: "FlaskConical",
      title: "Pharmacy Topic Library",
      description:
        "Teach clinical, regulatory, and therapeutics subjects students need most.",
      highlighted: true,
    },
    {
      icon: "Users",
      title: "Student Community",
      description:
        "Host discussions, Q&A, and forums that keep learners active between lessons.",
      highlighted: false,
    },
    {
      icon: "ShieldCheck",
      title: "Quality & Compliance",
      description:
        "Publish with tools that support accreditation-ready, evidence-based content.",
      highlighted: false,
    },
  ],
];

const studentPrograms: LandingProgramCard[][] = [
  [
    {
      image:
        "https://images.pexels.com/photos/8199252/pexels-photo-8199252.jpeg?auto=compress&cs=tinysrgb&w=600",
      imageAlt: "Student studying pharmacy at library — Yan Krukau on Pexels",
      category: "Pharmacy",
      title: "Pharmaceutical Chemistry Fundamentals",
      description:
        "Master the chemistry behind drugs to excel in pharmacokinetics and drug formulation.",
      rating: 4.3,
      reviewCount: 16325,
      instructor: {
        name: "Jane Cooper",
        avatar: "https://i.pravatar.cc/40?u=janecooper",
        enrolled: 2001,
      },
      price: 17.84,
      duration: "08 hr 12 mins",
    },
    {
      image:
        "https://images.pexels.com/photos/4307849/pexels-photo-4307849.jpeg?auto=compress&cs=tinysrgb&w=600",
      imageAlt: "Person studying online course — Ketut Subiyanto on Pexels",
      category: "Clinical",
      title: "Clinical Pharmacy Practice",
      description:
        "Design evidence-based care plans for patients across various clinical pharmacy settings.",
      rating: 3.9,
      reviewCount: 832,
      instructor: {
        name: "Jenny Wilson",
        avatar: "https://i.pravatar.cc/40?u=jennywilson",
        enrolled: 2001,
      },
      price: 8.99,
      duration: "06 hr 3 mins",
    },
    {
      image:
        "https://images.pexels.com/photos/8312669/pexels-photo-8312669.jpeg?auto=compress&cs=tinysrgb&w=600",
      imageAlt: "Professional pharmacist working — Dayana Joseph on Pexels",
      category: "Safety",
      title: "Drug Interaction Management",
      description:
        "Learn to identify and manage clinically significant drug interactions in modern practice.",
      rating: 4.2,
      reviewCount: 125,
      instructor: {
        name: "Esther Howard",
        avatar: "https://i.pravatar.cc/40?u=estherhoward",
        enrolled: 2001,
      },
      price: 11.7,
      duration: "01 hr 2 mins",
    },
  ],
  [
    {
      image:
        "https://images.pexels.com/photos/7693189/pexels-photo-7693189.jpeg?auto=compress&cs=tinysrgb&w=600",
      imageAlt: "Healthcare professionals collaborating — Yan Krukau on Pexels",
      category: "Pharmacology",
      title: "Advanced Pharmacokinetics",
      description:
        "Deep-dive into drug absorption, distribution, metabolism and excretion for clinical application.",
      rating: 4.5,
      reviewCount: 980,
      instructor: {
        name: "Albert Flores",
        avatar: "https://i.pravatar.cc/40?u=albertflores",
        enrolled: 1500,
      },
      price: 19.99,
      duration: "10 hr 30 mins",
    },
    {
      image:
        "https://images.pexels.com/photos/8199174/pexels-photo-8199174.jpeg?auto=compress&cs=tinysrgb&w=600",
      imageAlt: "Student holding books — Yan Krukau on Pexels",
      category: "Therapeutics",
      title: "Medication Therapy Management",
      description:
        "Optimise patient outcomes through comprehensive medication reviews and patient counseling.",
      rating: 4.7,
      reviewCount: 2100,
      instructor: {
        name: "Theresa Webb",
        avatar: "https://i.pravatar.cc/40?u=theresawebb",
        enrolled: 3200,
      },
      price: 14.5,
      duration: "07 hr 45 mins",
    },
    {
      image:
        "https://images.pexels.com/photos/7640741/pexels-photo-7640741.jpeg?auto=compress&cs=tinysrgb&w=600",
      imageAlt: "Team collaborating in office — Yan Krukau on Pexels",
      category: "Regulatory",
      title: "Pharmacy Law & Compliance",
      description:
        "Navigate federal and state pharmacy laws, ethics and professional responsibilities with confidence.",
      rating: 4.1,
      reviewCount: 540,
      instructor: {
        name: "Courtney Henry",
        avatar: "https://i.pravatar.cc/40?u=courtneyhenry",
        enrolled: 1200,
      },
      price: 12.0,
      duration: "05 hr 15 mins",
    },
  ],
];

const mentorPrograms: LandingProgramCard[][] = [
  [
    {
      image:
        "https://images.pexels.com/photos/7640741/pexels-photo-7640741.jpeg?auto=compress&cs=tinysrgb&w=600",
      imageAlt: "Mentor meeting with student — Yan Krukau on Pexels",
      category: "Career",
      title: "Residency Application Coaching",
      description:
        "Structured mentorship for program research, personal statements, and interview prep.",
      rating: 4.9,
      reviewCount: 412,
      instructor: {
        name: "Dr. Sarah Chen",
        avatar: "https://i.pravatar.cc/40?u=sarahchen",
        enrolled: 890,
      },
      price: 49.0,
      duration: "6 sessions",
    },
    {
      image:
        "https://images.pexels.com/photos/7693189/pexels-photo-7693189.jpeg?auto=compress&cs=tinysrgb&w=600",
      imageAlt: "Healthcare mentorship — Yan Krukau on Pexels",
      category: "Clinical",
      title: "Clinical Rotation Mentorship",
      description:
        "Weekly guidance for students navigating hospital rotations and patient care workflows.",
      rating: 4.8,
      reviewCount: 256,
      instructor: {
        name: "James Okonkwo",
        avatar: "https://i.pravatar.cc/40?u=jamesokonkwo",
        enrolled: 540,
      },
      price: 39.0,
      duration: "8 sessions",
    },
    {
      image:
        "https://images.pexels.com/photos/8199174/pexels-photo-8199174.jpeg?auto=compress&cs=tinysrgb&w=600",
      imageAlt: "Pharmacy student — Yan Krukau on Pexels",
      category: "Licensure",
      title: "NAPLEX & MPJE Prep Mentoring",
      description:
        "Exam strategy, study plans, and accountability from licensed pharmacist mentors.",
      rating: 4.7,
      reviewCount: 318,
      instructor: {
        name: "Maria Lopez",
        avatar: "https://i.pravatar.cc/40?u=marialopez",
        enrolled: 720,
      },
      price: 35.0,
      duration: "5 sessions",
    },
  ],
];

const instructorPrograms: LandingProgramCard[][] = [
  [
    {
      image:
        "https://images.pexels.com/photos/4307849/pexels-photo-4307849.jpeg?auto=compress&cs=tinysrgb&w=600",
      imageAlt: "Instructor teaching online — Ketut Subiyanto on Pexels",
      category: "Creator",
      title: "Launch Your First Pharmacy Course",
      description:
        "Step-by-step playbook for outlining modules, recording lessons, and publishing on PharmLMS.",
      rating: 4.9,
      reviewCount: 184,
      instructor: {
        name: "PharmLMS Team",
        avatar: "https://i.pravatar.cc/40?u=pharmlms",
        enrolled: 1200,
      },
      price: 0,
      duration: "Free guide",
    },
    {
      image:
        "https://images.pexels.com/photos/8312669/pexels-photo-8312669.jpeg?auto=compress&cs=tinysrgb&w=600",
      imageAlt: "Pharmacist educator — Dayana Joseph on Pexels",
      category: "Growth",
      title: "Grow Your Student Audience",
      description:
        "Marketing tips, pricing models, and retention tactics for clinical educators.",
      rating: 4.6,
      reviewCount: 97,
      instructor: {
        name: "Albert Flores",
        avatar: "https://i.pravatar.cc/40?u=albertflores",
        enrolled: 430,
      },
      price: 0,
      duration: "Toolkit",
    },
    {
      image:
        "https://images.pexels.com/photos/8199252/pexels-photo-8199252.jpeg?auto=compress&cs=tinysrgb&w=600",
      imageAlt: "Course creation — Yan Krukau on Pexels",
      category: "Platform",
      title: "Course Quality Checklist",
      description:
        "Standards for evidence-based content, assessments, and learner outcomes on PharmLMS.",
      rating: 4.8,
      reviewCount: 203,
      instructor: {
        name: "Theresa Webb",
        avatar: "https://i.pravatar.cc/40?u=theresawebb",
        enrolled: 650,
      },
      price: 0,
      duration: "Resource",
    },
  ],
];

export const landingContent: Record<LandingAudience, LandingPageContent> = {
  student: {
    navbar: {
      searchPlaceholder: "Want to learn?",
      signInHref: "/student/login",
      signUpHref: "/student/signup",
      signUpLabel: "Create free account",
    },
    hero: {
      headline: [
        { before: "Up Your ", highlight: "Skills" },
        { before: "To ", highlight: "Advance", after: " Your" },
        { highlight: "Career", after: " Path" },
      ],

      image:
        "https://images.pexels.com/photos/8199174/pexels-photo-8199174.jpeg?auto=compress&cs=tinysrgb&w=600",

      subcopy:
        "Learn clinical pharmacy skills with PharmLMS. The latest online learning system and material that help your knowledge growing.",
      primaryCta: { label: "Get Started", href: "/student/signup" },
      secondaryCta: { label: "Watch Demo", href: "/student/browse" },
      demoVideoUrl: DEFAULT_HERO_DEMO_VIDEO_URL,
      badges: [
        { icon: "BookOpen", label: "Evidence-Based Practice" },
        {
          icon: "Briefcase",
          label: "Patient-Centered",
          imageSrc: "/assets/Briefcase.png",
        },
        {
          icon: "Lightbulb",
          label: "Critical Thinking",
          imageSrc: "/assets/idea.svg",
        },
      ],
    },
    services: {
      eyebrow: "Our Services",
      titleLines: ["Fostering a playful & engaging", "learning environment"],
      groups: studentServices,
    },
    programs: {
      eyebrow: "Explore Programs",
      title: "Our Most Popular Class",
      description:
        "Let's join our famous class, the knowledge provided will definitely be useful for you.",
      pages: studentPrograms,
      cta: { label: "Explore All Programs", href: "/student/browse" },
    },
    people: {
      eyebrow: "Tutors",
      title: "Meet the Heroes",
      description:
        "On PharmLMS, instructors from all over the world instruct millions of students. We offer the knowledge and abilities.",
      members: [
        {
          name: "Theresa Webb",
          title: "Clinical Pharmacy Specialist",
          bio: "Former co-founder of ClinicalEdge. Early staff at MedRx and ClearScript.",
          avatar: "https://i.pravatar.cc/80?u=theresawebb",
        },
        {
          name: "Courtney Henry",
          title: "Director, PharmD Programme",
          bio: "Lead faculty teams at ASHP, NovaClin, and Protocol Labs.",
          avatar: "https://i.pravatar.cc/80?u=courtneyhenry",
        },
        {
          name: "Albert Flores",
          title: "Pharmacokinetics Educator",
          bio: "Former PM for PharmaLearn, Lambda School, and On Deck.",
          avatar: "https://i.pravatar.cc/80?u=albertflores",
        },
        {
          name: "Marvin McKinney",
          title: "Drug Safety & PV Instructor",
          bio: "Former clinical dev for GeneriCo, MedBase, and PostRx.",
          avatar: "https://i.pravatar.cc/80?u=marvinmckinney",
        },
      ],
    },
    testimonials: [
      {
        quote:
          "PharmLMS was fantastic! It is a master platform for those looking to start a new career, or need a refresher.",
        name: "Jacob Jones",
        role: "Student, National University",
        avatar: "https://i.pravatar.cc/56?u=jacobjones",
      },
      {
        quote:
          "The clinical pharmacy modules are world-class. I passed my board exams on the first attempt thanks to PharmLMS.",
        name: "Sarah Mitchell",
        role: "PharmD Graduate, State University",
        avatar: "https://i.pravatar.cc/56?u=sarahmitchell",
      },
      {
        quote:
          "Incredible platform — structured, easy to follow, and the mentor support is second to none.",
        name: "Daniel Okafor",
        role: "Clinical Pharmacist, Metro Health",
        avatar: "https://i.pravatar.cc/56?u=danielokafor",
      },
    ],
    blog: {
      title: "Our recent blogs",
      posts: [
        {
          image:
            "https://images.pexels.com/photos/7693189/pexels-photo-7693189.jpeg?auto=compress&cs=tinysrgb&w=600",
          imageAlt:
            "Team collaborating in modern office — Yan Krukau on Pexels",
          date: "November 16, 2024",
          title: "Three Pillars of Patient Delight",
          excerpt:
            "Patient satisfaction can be experienced viscerally, behaviourally, and reflectively. A great clinical interaction is ...",
          tags: [
            {
              label: "Research",
              color: "bg-pink-50 text-pink-600 border-pink-100",
            },
            {
              label: "Clinical UX",
              color: "bg-blue-50 text-blue-600 border-blue-100",
            },
          ],
        },
        {
          image:
            "https://images.pexels.com/photos/27920699/pexels-photo-27920699.jpeg?auto=compress&cs=tinysrgb&w=600",
          imageAlt: "Modern pharmacy workspace — Pușcaș Adryan on Pexels",
          date: "September 24, 2024",
          title: "Pharmacotherapy Mapping Methods",
          excerpt:
            "Evidence-based principles can be applied consistently throughout the process of creating a polished therapeutic map...",
          tags: [
            {
              label: "Research",
              color: "bg-pink-50 text-pink-600 border-pink-100",
            },
            {
              label: "Pharmacology",
              color: "bg-indigo-50 text-indigo-600 border-indigo-100",
            },
          ],
        },
        {
          image:
            "https://images.pexels.com/photos/7640741/pexels-photo-7640741.jpeg?auto=compress&cs=tinysrgb&w=600",
          imageAlt:
            "Colleagues in collaborative meeting — Yan Krukau on Pexels",
          date: "March 13, 2024",
          title: "Agile Development in Clinical Education and Usability",
          excerpt:
            "Agile methods aim to overcome usability barriers in traditional education, but post new threats to learning quality.",
          tags: [
            {
              label: "Programming",
              color: "bg-amber-50 text-amber-600 border-amber-100",
            },
            {
              label: "Research",
              color: "bg-violet-50 text-violet-600 border-violet-100",
            },
            {
              label: "Developments",
              color: "bg-rose-50 text-rose-600 border-rose-100",
            },
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
      ],
    },
  },
  mentor: {
    navbar: {
      searchPlaceholder: "Find mentorship topics…",
      signInHref: "/mentor/login",
      signUpHref: "/mentor/signup",
      signUpLabel: "Become a mentor",
    },
    hero: {
      headline: [
        { before: "Share Your ", highlight: "Insight" },
        { before: "To ", highlight: "Guide", after: " Future" },
        { highlight: "Pharmacy", after: " Leaders" },
      ],
      image: "/assets/mentor.jpg",
      subcopy:
        "Mentor pharmacy students and early-career pharmacists on PharmLMS. Offer 1:1 guidance, residency prep, and career coaching on your schedule.",
      primaryCta: { label: "Become a Mentor", href: "/mentor/signup" },
      secondaryCta: { label: "Watch Demo", href: "#services" },
      demoVideoUrl: DEFAULT_HERO_DEMO_VIDEO_URL,
      badges: [
        { icon: "Users", label: "1:1 Guidance" },
        { icon: "Calendar", label: "Career Roadmaps" },
        { icon: "BookOpen", label: "Flexible Scheduling" },
      ],
    },
    services: {
      eyebrow: "Mentor Tools",
      titleLines: ["Everything you need to guide", "the next generation"],
      groups: mentorServices,
    },
    programs: {
      eyebrow: "Popular Mentorship",
      title: "Mentorship Students Love",
      description:
        "Offer structured packages like these—or build your own—and connect with learners who need your expertise.",
      pages: mentorPrograms,
      cta: { label: "Start Mentoring Today", href: "/mentor/signup" },
    },
    people: {
      eyebrow: "Mentors",
      title: "Meet Our Mentors",
      description:
        "Experienced pharmacists on PharmLMS help students navigate rotations, licensure, and career decisions.",
      members: [
        {
          name: "Dr. Sarah Chen",
          title: "Residency Program Advisor",
          bio: "15 years in academic pharmacy. Mentored 200+ students into top residency programs.",
          avatar: "https://i.pravatar.cc/80?u=sarahchen",
        },
        {
          name: "James Okonkwo",
          title: "Clinical Pharmacy Mentor",
          bio: "Hospital pharmacist specializing in internal medicine and student precepting.",
          avatar: "https://i.pravatar.cc/80?u=jamesokonkwo",
        },
        {
          name: "Maria Lopez",
          title: "Licensure & Exam Coach",
          bio: "NAPLEX pass-rate coach with a structured study framework for PharmD candidates.",
          avatar: "https://i.pravatar.cc/80?u=marialopez",
        },
        {
          name: "Daniel Okafor",
          title: "Industry Career Mentor",
          bio: "Former retail lead now guiding transitions into clinical and industry roles.",
          avatar: "https://i.pravatar.cc/80?u=danielokafor",
        },
      ],
    },
    testimonials: [
      {
        quote:
          "Mentoring on PharmLMS let me give back while earning on a flexible schedule. The booking tools just work.",
        name: "Dr. Sarah Chen",
        role: "Clinical Mentor, PharmLMS",
        avatar: "https://i.pravatar.cc/56?u=sarahchen",
      },
      {
        quote:
          "I run residency prep sessions every fall. Students get clarity fast, and I manage everything in one dashboard.",
        name: "James Okonkwo",
        role: "Mentor, Metro Health System",
        avatar: "https://i.pravatar.cc/56?u=jamesokonkwo",
      },
      {
        quote:
          "The platform makes it easy to share resources, track mentee progress, and stay organized between sessions.",
        name: "Maria Lopez",
        role: "Licensure Coach, PharmLMS",
        avatar: "https://i.pravatar.cc/56?u=marialopez",
      },
    ],
    blog: {
      title: "Insights for mentors",
      posts: [
        {
          image:
            "https://images.pexels.com/photos/7640741/pexels-photo-7640741.jpeg?auto=compress&cs=tinysrgb&w=600",
          imageAlt: "Mentor and mentee discussion — Yan Krukau on Pexels",
          date: "October 8, 2024",
          title: "How to Structure a 30-Minute Mentorship Session",
          excerpt:
            "A simple agenda that keeps conversations focused on goals, feedback, and next steps for pharmacy students...",
          tags: [
            {
              label: "Mentorship",
              color: "bg-emerald-50 text-emerald-700 border-emerald-100",
            },
            {
              label: "Career",
              color: "bg-blue-50 text-blue-600 border-blue-100",
            },
          ],
        },
        {
          image:
            "https://images.pexels.com/photos/7693189/pexels-photo-7693189.jpeg?auto=compress&cs=tinysrgb&w=600",
          imageAlt: "Healthcare team — Yan Krukau on Pexels",
          date: "August 2, 2024",
          title: "Residency Interview Prep: What Mentees Ask Most",
          excerpt:
            "Top questions from PharmD students—and how experienced mentors answer them with confidence...",
          tags: [
            {
              label: "Residency",
              color: "bg-indigo-50 text-indigo-600 border-indigo-100",
            },
            {
              label: "Coaching",
              color: "bg-pink-50 text-pink-600 border-pink-100",
            },
          ],
        },
        {
          image:
            "https://images.pexels.com/photos/8199174/pexels-photo-8199174.jpeg?auto=compress&cs=tinysrgb&w=600",
          imageAlt: "Pharmacy student — Yan Krukau on Pexels",
          date: "June 14, 2024",
          title: "Building a Mentorship Profile Students Trust",
          excerpt:
            "Credentials, specialties, and availability tips that help the right mentees find you on PharmLMS.",
          tags: [
            {
              label: "Growth",
              color: "bg-amber-50 text-amber-600 border-amber-100",
            },
            {
              label: "Platform",
              color: "bg-violet-50 text-violet-600 border-violet-100",
            },
          ],
          featured: true,
        },
        {
          image:
            "https://images.pexels.com/photos/32216281/pexels-photo-32216281.png?auto=compress&cs=tinysrgb&w=600",
          imageAlt: "Clinical office — The Ghazi on Pexels",
          date: "April 1, 2024",
          title: "",
          excerpt: "",
          tags: [],
          featured: true,
        },
      ],
    },
  },
  instructor: {
    navbar: {
      searchPlaceholder: "Search teaching topics…",
      signInHref: "/tutor/login",
      signUpHref: "/tutor/signup",
      signUpLabel: "Start teaching",
    },
    hero: {
      headline: [
        { before: "Turn Your ", highlight: "Expertise" },
        { before: "Into ", highlight: "Courses", after: " That" },
        { highlight: "Inspire", after: " Learners" },
      ],
      image: "/assets/tutor.jpg",
      subcopy:
        "Publish pharmacy courses on PharmLMS, reach students worldwide, and grow your teaching brand with built-in analytics and payments.",
      primaryCta: { label: "Start Teaching", href: "/tutor/signup" },
      secondaryCta: { label: "Watch Demo", href: "/tutor/login" },
      demoVideoUrl: DEFAULT_HERO_DEMO_VIDEO_URL,
      badges: [
        { icon: "Video", label: "Course Builder" },
        { icon: "BarChart3", label: "Learner Analytics" },
        { icon: "Wallet", label: "Earn on Your Terms" },
      ],
    },
    services: {
      eyebrow: "Creator Platform",
      titleLines: ["Build, publish, and grow", "your pharmacy courses"],
      groups: instructorServices,
    },
    programs: {
      eyebrow: "Creator Resources",
      title: "Tools & Guides for Instructors",
      description:
        "Free resources to help you launch quality courses and attract engaged pharmacy students.",
      pages: instructorPrograms,
      cta: { label: "Create Your First Course", href: "/tutor/signup" },
    },
    people: {
      eyebrow: "Instructors",
      title: "Top Educators on PharmLMS",
      description:
        "Pharmacists and educators publish clinical content that thousands of students rely on every day.",
      members: [
        {
          name: "Theresa Webb",
          title: "Clinical Pharmacy Educator",
          bio: "12 published courses on therapeutics and patient counseling. 8K+ enrollments.",
          avatar: "https://i.pravatar.cc/80?u=theresawebb",
        },
        {
          name: "Albert Flores",
          title: "Pharmacokinetics Instructor",
          bio: "Known for clear, visual lessons on ADME and dosing across care settings.",
          avatar: "https://i.pravatar.cc/80?u=albertflores",
        },
        {
          name: "Courtney Henry",
          title: "Regulatory & Law Instructor",
          bio: "Former compliance lead teaching pharmacy law for new graduates.",
          avatar: "https://i.pravatar.cc/80?u=courtneyhenry",
        },
        {
          name: "Marvin McKinney",
          title: "Drug Safety Instructor",
          bio: "Pharmacovigilance specialist with industry and academic teaching experience.",
          avatar: "https://i.pravatar.cc/80?u=marvinmckinney",
        },
      ],
    },
    testimonials: [
      {
        quote:
          "I launched my first clinical course in a weekend. PharmLMS handles enrollments, payments, and student messages.",
        name: "Theresa Webb",
        role: "Instructor, PharmLMS",
        avatar: "https://i.pravatar.cc/56?u=theresawebb",
      },
      {
        quote:
          "Analytics showed me which modules students struggled with. I improved retention and doubled enrollments.",
        name: "Albert Flores",
        role: "Course Creator, PharmLMS",
        avatar: "https://i.pravatar.cc/56?u=albertflores",
      },
      {
        quote:
          "The course builder is straightforward. I focus on teaching; the platform takes care of the rest.",
        name: "Courtney Henry",
        role: "Instructor, State University",
        avatar: "https://i.pravatar.cc/56?u=courtneyhenry",
      },
    ],
    blog: {
      title: "Tips for course creators",
      posts: [
        {
          image:
            "https://images.pexels.com/photos/4307849/pexels-photo-4307849.jpeg?auto=compress&cs=tinysrgb&w=600",
          imageAlt: "Online teaching — Ketut Subiyanto on Pexels",
          date: "November 2, 2024",
          title: "Recording Pharmacy Lectures Students Actually Watch",
          excerpt:
            "Lighting, pacing, and slide design habits that keep clinical content engaging from module one...",
          tags: [
            {
              label: "Teaching",
              color: "bg-emerald-50 text-emerald-700 border-emerald-100",
            },
            {
              label: "Video",
              color: "bg-blue-50 text-blue-600 border-blue-100",
            },
          ],
        },
        {
          image:
            "https://images.pexels.com/photos/8312669/pexels-photo-8312669.jpeg?auto=compress&cs=tinysrgb&w=600",
          imageAlt: "Pharmacist educator — Dayana Joseph on Pexels",
          date: "September 18, 2024",
          title: "Pricing Your First Clinical Course",
          excerpt:
            "How instructors balance accessibility, value, and sustainable revenue on PharmLMS...",
          tags: [
            {
              label: "Monetization",
              color: "bg-amber-50 text-amber-600 border-amber-100",
            },
            {
              label: "Strategy",
              color: "bg-indigo-50 text-indigo-600 border-indigo-100",
            },
          ],
        },
        {
          image:
            "https://images.pexels.com/photos/8199252/pexels-photo-8199252.jpeg?auto=compress&cs=tinysrgb&w=600",
          imageAlt: "Student learning — Yan Krukau on Pexels",
          date: "July 6, 2024",
          title: "Designing Assessments That Measure Real Competency",
          excerpt:
            "Case-based quizzes and rubrics that align with pharmacy education outcomes and board-style thinking.",
          tags: [
            {
              label: "Assessment",
              color: "bg-pink-50 text-pink-600 border-pink-100",
            },
            {
              label: "Quality",
              color: "bg-violet-50 text-violet-600 border-violet-100",
            },
          ],
          featured: true,
        },
        {
          image:
            "https://images.pexels.com/photos/32216281/pexels-photo-32216281.png?auto=compress&cs=tinysrgb&w=600",
          imageAlt: "Clinical workspace — The Ghazi on Pexels",
          date: "May 10, 2024",
          title: "",
          excerpt: "",
          tags: [],
          featured: true,
        },
      ],
    },
  },
};

export function getLandingContent(
  audience: LandingAudience,
): LandingPageContent {
  return landingContent[audience];
}
