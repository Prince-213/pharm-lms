import LandingHeader from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { ScrollToTopButton } from "@/components/landing/scroll-to-top-button";
import { SmoothScrollProvider } from "@/components/system/smooth-scroll";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SmoothScrollProvider>
      <LandingHeader />
      {children}
      <LandingFooter />
      <ScrollToTopButton />
    </SmoothScrollProvider>
  );
}
