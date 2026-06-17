import Link from "next/link";
import Image from "next/image";

type AuthPageShellProps = {
  children: React.ReactNode;
  actorType: "student" | "tutor" | "mentor";
  mode: "login" | "signup";
};

const otherPortals: Record<string, { label: string; href: string; avatar: string }[]> = {
  student: [
    { label: "Tutor", href: "/tutor/login", avatar: "/assets/icons8-training-100.png" },
    { label: "Mentor", href: "/mentor/login", avatar: "/assets/icons8-coach-96.png" },
  ],
  tutor: [
    { label: "Student", href: "/student/login", avatar: "/assets/icons8-student-male-100.png" },
    { label: "Mentor", href: "/mentor/login", avatar: "/assets/icons8-coach-96.png" },
  ],
  mentor: [
    { label: "Student", href: "/student/login", avatar: "/assets/icons8-student-male-100.png" },
    { label: "Tutor", href: "/tutor/login", avatar: "/assets/icons8-training-100.png" },
  ],
};

export function AuthPageShell({ children, actorType, mode }: AuthPageShellProps) {
  const isLogin = mode === "login";
  const title = isLogin ? "Log In to" : "Register";
  const subtitle = "Welcome back! Select method to log in";
  const description = isLogin
    ? "Securely access your courses, track your progress, and connect with a community of pharmacists moving from dispensing to decision-making."
    : "Join Africa's first pharmacy-specific digital health platform. Build clinical, data, and technology skills with courses built around real African clinical contexts.";
  const otherSectors = otherPortals[actorType] ?? [];

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left purple side */}
      <div className="relative flex flex-col bg-[var(--primary)] px-6 py-8 text-white lg:w-1/2 lg:px-12 lg:py-10 overflow-hidden">
        {/* Logo */}
        <Link href="/" className="inline-block">
          <Image
            src="/assets/pharmlms-logo.png"
            alt="PharmLMS"
            width={160}
            height={40}
            className="h-8 w-auto sm:h-9 brightness-0 invert"
            priority
          />
        </Link>

        {/* Content */}
        <div className="mt-6 lg:mt-10">
          <h1 className="font-display text-[2rem] font-bold leading-tight sm:text-[2.5rem] lg:text-[3rem]">
            {title}
          </h1>
          <p className="mt-3 text-sm font-semibold text-white/90">
            {subtitle}
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-white/75 max-w-md">
            {description}
          </p>
        </div>

        {/* Decorative image */}
        <div className="mt-2 flex justify-end lg:mt-3 absolute -right-10">
          <Image
            src="/assets/shape23.png"
            alt=""
            width={400}
            height={400}
            className="h-72 w-auto object-contain lg:h-[30rem]"
            aria-hidden="true"
          />
        </div>

        {/* Login as cards */}
        <div className="mt-6 lg:mt-20">
          <p className="text-lg font-semibold text-white/90 mb-3">Login as</p>
          <div className="flex gap-4">
            {otherSectors.map((sector) => (
              <Link
                key={sector.label}
                href={sector.href}
                className="group flex flex-col items-center gap-2"
              >
                <div className="relative">
                  <div className="h-20 w-20 overflow-hidden rounded-full lg:h-24 lg:w-24 relative">
                    <Image
                      src={sector.avatar}
                      alt={sector.label}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-white group-hover:text-white/80 transition-colors">
                  Login as {sector.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="mt-auto pt-6">
          <Image
            src="/assets/shape24.png"
            alt=""
            width={200}
            height={40}
            className="h-10 w-auto object-contain"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Right side: white card on gray background */}
      <div className="flex items-center justify-center bg-[#f5f5f5] px-4 py-8 lg:w-1/2 lg:px-8 lg:py-4">
        <div className="w-full max-w-[520px] rounded-[24px] bg-white px-6 py-8 shadow-[0_2px_16px_rgba(0,0,0,0.06)] lg:px-12 lg:py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
