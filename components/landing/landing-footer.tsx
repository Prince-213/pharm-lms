import Link from "next/link";
import { GraduationCap } from "@/lib/icons/server";

// Inline brand SVGs — Lucide v1 removed all brand/logo icons
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function DribbbleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.017-8.04 6.37 1.73 1.35 3.9 2.163 6.29 2.163 1.42 0 2.77-.29 4-.813zm-9.54-3.38c.225-.375 2.907-4.854 8.188-6.557.13-.045.26-.08.39-.12-.25-.566-.52-1.13-.79-1.68-5.046 1.514-9.942 1.45-10.38 1.44l-.009.28c0 2.65.995 5.07 2.6 6.637zm-2.49-8.618c.45.005 4.665.015 9.43-1.24C11.54 5.51 9.87 3.63 9.73 3.48 7.02 4.8 4.93 7.124 4.08 9.974zm7.61-7.224c.14.155 1.88 2.037 3.49 4.97 3.33-1.246 4.74-3.135 4.91-3.38-1.56-1.39-3.61-2.23-5.86-2.23-.852 0-1.68.132-2.464.37l-.075.27z" />
    </svg>
  );
}

const productLinks = ["Overview", "Features", "Solutions", "Tutorials", "Pricing"];
const companyLinks = [
  { label: "About us", badge: false },
  { label: "Careers", badge: false },
  { label: "Press", badge: true },
  { label: "News", badge: false },
];
const socialLinks = ["Twitter", "LinkedIn", "GitHub", "Dribbble"];
const legalLinks = ["Terms", "Privacy", "Cookies", "Contact"];

export function LandingFooter() {
  return (
    <footer className="bg-[#0d1117] text-slate-400">
      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 font-display text-xl font-bold text-white">
              <GraduationCap className="h-7 w-7 text-[var(--emerald)]" strokeWidth={1.75} />
              PharmLMS
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
              Top learning experiences that create more talent in the world.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Product
            </p>
            <ul className="flex flex-col gap-3">
              {productLinks.map((l) => (
                <li key={l}>
                  <Link href="#" className="text-sm hover:text-white transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Company
            </p>
            <ul className="flex flex-col gap-3">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link href="#" className="inline-flex items-center gap-2 text-sm hover:text-white transition-colors">
                    {l.label}
                    {l.badge && (
                      <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs font-semibold text-white">
                        New
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Social
            </p>
            <ul className="flex flex-col gap-3">
              {socialLinks.map((l) => (
                <li key={l}>
                  <Link href="#" className="text-sm hover:text-white transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Legal
            </p>
            <ul className="flex flex-col gap-3">
              {legalLinks.map((l) => (
                <li key={l}>
                  <Link href="#" className="text-sm hover:text-white transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-6 lg:px-10">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} PharmLMS. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[
              { Icon: TwitterIcon, label: "Twitter" },
              { Icon: LinkedinIcon, label: "LinkedIn" },
              { Icon: FacebookIcon, label: "Facebook" },
              { Icon: GithubIcon, label: "GitHub" },
              { Icon: DribbbleIcon, label: "Dribbble" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="text-slate-600 transition-colors hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
