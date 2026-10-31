import "./globals.css";
import Script from "next/script";
import { Toaster } from "sonner";
import { CookieBanner } from "@/components/legal/cookie-banner";
import { SessionProviderWrapper } from "@/components/session-provider-wrapper";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fontVariables, montserrat } from "@/lib/fonts";
import { MARKETING_THEME_BOOTSTRAP } from "@/lib/marketing-theme";
import { rootMetadata } from "@/lib/site-metadata";
import { cn } from "@/lib/utils";

export const metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", fontVariables)}
      suppressHydrationWarning
    >
      <body
        className={cn(
          "flex min-h-full flex-col font-sans",
          montserrat.className,
        )}
      >
        <Script id="pharm-marketing-theme" strategy="beforeInteractive">
          {MARKETING_THEME_BOOTSTRAP}
        </Script>
        <TooltipProvider>
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </TooltipProvider>
        <CookieBanner />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
