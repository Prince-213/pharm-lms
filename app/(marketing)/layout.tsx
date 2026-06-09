import LandingHeader from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { ScrollToTopButton } from "@/components/landing/scroll-to-top-button";


export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <LandingHeader />
      {children}
      <LandingFooter />
      <ScrollToTopButton />
    </>
  );
}
