import LandingHeader from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-marketing className="overflow-x-clip">
      <LandingHeader />
      {children}
      <LandingFooter />
    </div>
  );
}
