export type AuthActorType = "student" | "tutor" | "mentor" | "admin";

export const portalAuthCopy: Record<
  AuthActorType,
  {
    badge: string;
    sidebarTitle: string;
    loginSubtitle: string;
    signupSubtitle: string;
    verifySubtitle: string;
  }
> = {
  student: {
    badge: "Student portal",
    sidebarTitle: "Student authentication",
    loginSubtitle: "Sign in to access your courses, progress, and learner dashboard.",
    signupSubtitle: "Create your learner account to browse and enroll in courses.",
    verifySubtitle: "Verify your email to finish creating your student account.",
  },
  tutor: {
    badge: "Tutor portal",
    sidebarTitle: "Tutor authentication",
    loginSubtitle: "Sign in to manage courses, curriculum, and your instructor workspace.",
    signupSubtitle: "Create your tutor account to start teaching on PharmLMS.",
    verifySubtitle: "Verify your email to finish creating your tutor account.",
  },
  mentor: {
    badge: "Mentor portal",
    sidebarTitle: "Mentor authentication",
    loginSubtitle: "Sign in to manage mentorship sessions and your mentor profile.",
    signupSubtitle: "Apply for a mentor account to guide pharmacy learners.",
    verifySubtitle: "Verify your email to finish your mentor application.",
  },
  admin: {
    badge: "Admin portal",
    sidebarTitle: "Admin authentication",
    loginSubtitle: "Secure access for platform administrators.",
    signupSubtitle: "Admin accounts are provisioned by the platform team.",
    verifySubtitle: "Verify your email.",
  },
};
