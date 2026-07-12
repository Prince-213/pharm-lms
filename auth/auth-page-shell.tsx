import { AuthLayoutShell } from "@/auth/auth-layout-shell";
import { portalAuthCopy } from "@/lib/auth/portal-auth-copy";

type AuthPageShellProps = {
  children: React.ReactNode;
  actorType: "student" | "tutor" | "mentor";
  mode: "login" | "signup";
};

const portalCopy: Record<
  AuthPageShellProps["actorType"],
  { quote: string; author: string }
> = {
  student: {
    quote:
      "PharmLMS helped me move from dispensing to clinical decision-making — courses built for real African pharmacy practice.",
    author: "Adaeze O., Clinical Pharmacist",
  },
  tutor: {
    quote:
      "Publishing courses on PharmLMS let me reach pharmacy professionals across Africa with a professional builder and analytics.",
    author: "Dr. Kwame A., Course Author",
  },
  mentor: {
    quote:
      "Mentoring on PharmLMS gives me flexible scheduling and a trusted way to guide the next generation of pharmacists.",
    author: "Chidi M., Mentor",
  },
};

export function AuthPageShell({ children, actorType }: AuthPageShellProps) {
  const copy = portalCopy[actorType];
  const portal = portalAuthCopy[actorType];

  return (
    <AuthLayoutShell
      quote={copy.quote}
      author={copy.author}
      portalLabel={portal.sidebarTitle}
    >
      {children}
    </AuthLayoutShell>
  );
}
