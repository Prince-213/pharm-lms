import Link from "next/link";
import { LegalLinks } from "@/components/brand/legal-links";
import { PharmLogo } from "@/components/brand/pharm-logo";

export function DashboardChromeFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-background px-4 py-4 lg:px-6">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="w-fit">
          <PharmLogo
            markClassName="h-6 w-6"
            wordmarkClassName="text-sm text-foreground"
          />
        </Link>
        <div className="flex flex-col gap-1 sm:items-end">
          <LegalLinks
            className="text-xs"
            linkClassName="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          />
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} PharmEdge
          </p>
        </div>
      </div>
    </footer>
  );
}
